package fr.axa.openpaas.dailyclean.resource;

import fr.axa.openpaas.dailyclean.model.Status;
import fr.axa.openpaas.dailyclean.util.KubernetesUtils;
import io.fabric8.kubernetes.api.model.Container;
import io.fabric8.kubernetes.api.model.ContainerPort;
import io.fabric8.kubernetes.api.model.ObjectMeta;
import io.fabric8.kubernetes.api.model.PodSpec;
import io.fabric8.kubernetes.api.model.PodTemplateSpec;
import io.fabric8.kubernetes.api.model.Quantity;
import io.fabric8.kubernetes.api.model.ResourceRequirements;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.api.model.apps.DeploymentSpec;
import io.fabric8.kubernetes.api.model.apps.DeploymentStatus;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.server.mock.KubernetesServer;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.kubernetes.client.KubernetesTestServer;
import io.quarkus.test.kubernetes.client.WithKubernetesTestServer;
import io.restassured.response.Response;
import io.restassured.response.ValidatableResponse;
import io.restassured.response.ValidatableResponseOptions;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.ws.rs.core.MediaType;
import java.util.Arrays;
import java.util.HashMap;

import static fr.axa.openpaas.dailyclean.model.Status.StateEnum.IN_PROGRESS;
import static fr.axa.openpaas.dailyclean.model.Status.StateEnum.STARTED;
import static fr.axa.openpaas.dailyclean.model.Status.StateEnum.STOPPED;
import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.Matchers.empty;

@WithKubernetesTestServer
@QuarkusTest
public class StatusResourceTest {

    private static final String DEPLOY_ML = "deployMl";
    private static final String DEPLOY_ES = "deployEs";
    private static final String DEPLOYMENT_JSON_PATH = "deployments.find { deployment -> deployment.id == '%s' }.%s";

    @KubernetesTestServer
    KubernetesServer mockServer;

    private static final String DAILYCLEAN_LABEL_NAME = "axa.com/dailyclean";

    @BeforeEach
    public void before() {
        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();
        client.apps().deployments().inNamespace(namespace).delete();
    }

    @Test
    public void getStatusWithStateStarted() {
        // Initialize Data
        Deployment deploymentDailyclean = getDeploymentDailyclean();
        Deployment deploymentMl = getDeployment(DEPLOY_ML, 1, 3);
        Deployment deploymentEs = getDeployment(DEPLOY_ES, 2, 2);

        final String namespace = createDeploymentsAndGetNamespace(deploymentDailyclean, deploymentMl, deploymentEs);

        // Map
        fr.axa.openpaas.dailyclean.model.Deployment deploymentReturnedDailyclean =
                KubernetesUtils.mapDeployment(deploymentDailyclean, DAILYCLEAN_LABEL_NAME);
        fr.axa.openpaas.dailyclean.model.Deployment deploymentReturnedMl =
                KubernetesUtils.mapDeployment(deploymentMl, DAILYCLEAN_LABEL_NAME);
        fr.axa.openpaas.dailyclean.model.Deployment deploymentReturnedEs =
                KubernetesUtils.mapDeployment(deploymentEs, DAILYCLEAN_LABEL_NAME);

        // Test
        assertGetStatus(namespace, STARTED, deploymentReturnedDailyclean, deploymentReturnedMl, deploymentReturnedEs);
    }

    @Test
    public void getStatusWithStateStopped() {
        // Initialize Data
        Deployment deploymentDailyclean = getDeploymentDailyclean();
        Deployment deploymentMl = getDeployment(DEPLOY_ML, 0, 3);
        Deployment deploymentEs = getDeployment(DEPLOY_ES, 0, 2);

        final String namespace = createDeploymentsAndGetNamespace(deploymentDailyclean, deploymentMl, deploymentEs);

        // Map
        fr.axa.openpaas.dailyclean.model.Deployment deploymentReturnedDailyclean =
                KubernetesUtils.mapDeployment(deploymentDailyclean, DAILYCLEAN_LABEL_NAME);
        fr.axa.openpaas.dailyclean.model.Deployment deploymentReturnedMl =
                KubernetesUtils.mapDeployment(deploymentMl, DAILYCLEAN_LABEL_NAME);
        fr.axa.openpaas.dailyclean.model.Deployment deploymentReturnedEs =
                KubernetesUtils.mapDeployment(deploymentEs, DAILYCLEAN_LABEL_NAME);

        // Test
        assertGetStatus(namespace, STOPPED, deploymentReturnedDailyclean, deploymentReturnedMl, deploymentReturnedEs);
    }

    @Test
    public void getStatusWithStateInProgress() {
        // Initialize Data
        Deployment deploymentDailyclean = getDeploymentDailyclean();
        Deployment deploymentMl = getDeployment(DEPLOY_ML, 3, 3);
        Deployment deploymentEs = getDeployment(DEPLOY_ES, 0, 2);

        final String namespace = createDeploymentsAndGetNamespace(deploymentDailyclean, deploymentMl, deploymentEs);

        // Map
        fr.axa.openpaas.dailyclean.model.Deployment deploymentReturnedDailyclean =
                KubernetesUtils.mapDeployment(deploymentDailyclean, DAILYCLEAN_LABEL_NAME);
        fr.axa.openpaas.dailyclean.model.Deployment deploymentReturnedMl =
                KubernetesUtils.mapDeployment(deploymentMl, DAILYCLEAN_LABEL_NAME);
        fr.axa.openpaas.dailyclean.model.Deployment deploymentReturnedEs =
                KubernetesUtils.mapDeployment(deploymentEs, DAILYCLEAN_LABEL_NAME);

        // Test
        assertGetStatus(namespace, IN_PROGRESS, deploymentReturnedDailyclean, deploymentReturnedMl, deploymentReturnedEs);
    }

    @Test
    public void getStatusWithoutAnyDeployment() {
        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();

        given()
                .contentType(MediaType.APPLICATION_JSON)
                .when()
                .get("/status")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .body("namespace", is(namespace))
                .body("state", is(STOPPED.value()))
                .body("deployments", is(empty()));

    }

    private void assertGetStatus(String namespace,
                                 Status.StateEnum state,
                                 fr.axa.openpaas.dailyclean.model.Deployment ... deployments) {
        final ValidatableResponseOptions<ValidatableResponse, Response> response =
            given()
                .contentType(MediaType.APPLICATION_JSON)
                .when()
                .get("/status")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .body("namespace", is(namespace))
                .body("state", is(state.value()))
                .body("deployments.size()", is(deployments.length));

        Arrays.stream(deployments).forEach(deployment -> response
                .body(getDeploymentJsonPath(deployment.getId(), "isDailycleaned"),
                        is(deployment.getIsDailycleaned()))
                .body(getDeploymentJsonPath(deployment.getId(), "current"),
                        is(deployment.getCurrent().intValue()))
                .body(getDeploymentJsonPath(deployment.getId(), "target"),
                        is(deployment.getTarget().intValue()))
                .body(getDeploymentJsonPath(deployment.getId(), "labels"),
                        is(deployment.getLabels()))
                .body(getDeploymentJsonPath(deployment.getId(), "annotations"),
                        is(deployment.getAnnotations()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers.size()"),
                        is(deployment.getContainers().size()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].name"),
                        is(deployment.getContainers().get(0).getName()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].image"),
                        is(deployment.getContainers().get(0).getImage()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].resource_limits[0].format"),
                        is(deployment.getContainers().get(0).getResourceLimits().get(0).getFormat()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].resource_limits[0].name"),
                        is(deployment.getContainers().get(0).getResourceLimits().get(0).getName()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].resource_limits[0].amount"),
                        is(deployment.getContainers().get(0).getResourceLimits().get(0).getAmount()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].resource_limits[0].raw_amount"),
                        is(deployment.getContainers().get(0).getResourceLimits().get(0).getRawAmount()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].resource_limits[1].format"),
                        is(deployment.getContainers().get(0).getResourceLimits().get(1).getFormat()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].resource_limits[1].name"),
                        is(deployment.getContainers().get(0).getResourceLimits().get(1).getName()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].resource_limits[1].amount"),
                        is(deployment.getContainers().get(0).getResourceLimits().get(1).getAmount()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].resource_limits[1].raw_amount"),
                        is(deployment.getContainers().get(0).getResourceLimits().get(1).getRawAmount()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].resource_requests[0].format"),
                        is(deployment.getContainers().get(0).getResourceRequests().get(0).getFormat()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].resource_requests[0].name"),
                        is(deployment.getContainers().get(0).getResourceRequests().get(0).getName()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].resource_requests[0].amount"),
                        is(deployment.getContainers().get(0).getResourceRequests().get(0).getAmount()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].resource_requests[0].raw_amount"),
                        is(deployment.getContainers().get(0).getResourceRequests().get(0).getRawAmount()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].resource_requests[1].format"),
                        is(deployment.getContainers().get(0).getResourceRequests().get(1).getFormat()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].resource_requests[1].name"),
                        is(deployment.getContainers().get(0).getResourceRequests().get(1).getName()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].resource_requests[1].amount"),
                        is(deployment.getContainers().get(0).getResourceRequests().get(1).getAmount()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].resource_requests[1].raw_amount"),
                        is(deployment.getContainers().get(0).getResourceRequests().get(1).getRawAmount()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].ports[0].port"),
                        is(deployment.getContainers().get(0).getPorts().get(0).getPort()))
                .body(getDeploymentJsonPath(deployment.getId(), "containers[0].ports[0].protocol"),
                        is(deployment.getContainers().get(0).getPorts().get(0).getProtocol())));
    }

    private static String getDeploymentJsonPath(final String id, final String fieldName) {
        return String.format(DEPLOYMENT_JSON_PATH, id, fieldName);
    }

    private String createDeploymentsAndGetNamespace(Deployment ... deployments) {
        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();
        Arrays.stream(deployments)
                .forEach(deployment -> client.apps().deployments().inNamespace(namespace).create(deployment));
        return namespace;
    }

    private Deployment getDeployment(String name, int readyReplicas, int replicas) {
        Deployment deployment = new Deployment();
        deployment.setMetadata(new ObjectMeta());
        deployment.getMetadata().setName(name);
        deployment.getMetadata().setLabels(new HashMap<>());
        deployment.getMetadata().getLabels().put("name", name);
        DeploymentStatus deploymentStatus = new DeploymentStatus();
        deploymentStatus.setReplicas(replicas);
        deploymentStatus.setReadyReplicas(readyReplicas);
        deployment.setStatus(deploymentStatus);

        setContainer(deployment);

        return deployment;
    }

    private Deployment getDeploymentDailyclean() {
        Deployment deploymentDailyclean = new Deployment();
        deploymentDailyclean.setMetadata(new ObjectMeta());
        deploymentDailyclean.getMetadata().setName("deployDailyclean");
        deploymentDailyclean.getMetadata().setLabels(new HashMap<>());
        deploymentDailyclean.getMetadata().getLabels().put(DAILYCLEAN_LABEL_NAME, "false");
        deploymentDailyclean.getMetadata().getLabels().put("name", "deployDailyclean");
        DeploymentStatus statusDailyclean = new DeploymentStatus();
        deploymentDailyclean.setStatus(statusDailyclean);
        statusDailyclean.setReadyReplicas(1);
        statusDailyclean.setReplicas(1);

        setContainer(deploymentDailyclean);

        return deploymentDailyclean;
    }

    private void setContainer(Deployment deployment) {
        DeploymentSpec spec = new DeploymentSpec();
        PodTemplateSpec templateSpec = new PodTemplateSpec();
        PodSpec podSpec = new PodSpec();
        Container container = new Container();
        container.setName("container");
        container.setImage("image:1.0");
        ContainerPort port = new ContainerPort();
        port.setContainerPort(8080);
        port.setProtocol("TCP");
        container.getPorts().add(port);
        podSpec.getContainers().add(container);
        templateSpec.setSpec(podSpec);
        spec.setTemplate(templateSpec);
        deployment.setSpec(spec);

        ResourceRequirements resourceRequirements = new ResourceRequirements();
        resourceRequirements.setLimits(new HashMap<>());
        resourceRequirements.getLimits().put("cpu", new Quantity("10"));
        resourceRequirements.getLimits().put("memory", new Quantity("748", "Mi"));
        resourceRequirements.setRequests(new HashMap<>());
        resourceRequirements.getRequests().put("cpu", new Quantity("1", "m"));
        resourceRequirements.getRequests().put("memory", new Quantity("1024", "Mi"));
        container.setResources(resourceRequirements);
    }
}
