package fr.axa.openpaas.dailyclean.resource;

import fr.axa.openpaas.dailyclean.model.Status;
import fr.axa.openpaas.dailyclean.model.Workload;
import fr.axa.openpaas.dailyclean.util.KubernetesUtils;
import fr.axa.openpaas.dailyclean.util.wrapper.DeploymentWrapper;
import fr.axa.openpaas.dailyclean.util.wrapper.StatefulSetWrapper;
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
import io.fabric8.kubernetes.api.model.apps.StatefulSet;
import io.fabric8.kubernetes.api.model.apps.StatefulSetSpec;
import io.fabric8.kubernetes.api.model.apps.StatefulSetStatus;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.kubernetes.client.KubernetesServer;
import io.quarkus.test.kubernetes.client.KubernetesTestServer;
import io.quarkus.test.kubernetes.client.WithKubernetesTestServer;
import io.restassured.response.Response;
import io.restassured.response.ValidatableResponse;
import io.restassured.response.ValidatableResponseOptions;
import jakarta.ws.rs.core.MediaType;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

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

    private static final String DEPLOY_DAILYCLEAN = "deployDailyclean";
    private static final String DEPLOY_ML = "deployMl";
    private static final String DEPLOY_ES = "deployEs";
    private static final String STATEFUL_SET_MYSQL = "mysql";
    private static final String STATEFUL_SET_REDIS = "redis";

    private static final String DEPLOYMENT_JSON_PATH = "workloads.find { workload -> workload.id == '%s' }.%s";

    @KubernetesTestServer
    KubernetesServer mockServer;

    private static final String DAILYCLEAN_LABEL_NAME = "axa.com/dailyclean";

    @BeforeEach
    public void before() {
        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();
        client.apps().deployments().inNamespace(namespace).delete();
        client.apps().statefulSets().inNamespace(namespace).delete();
    }

    @Test
    public void getStatusWithStateStarted() {
        // Initialize Data
        Deployment deploymentDailyclean = getDeployment(DEPLOY_DAILYCLEAN, 1, 1, false);
        Deployment deploymentMl = getDeployment(DEPLOY_ML, 1, 3, null);
        Deployment deploymentEs = getDeployment(DEPLOY_ES, 2, 2, null);

        StatefulSet mysqlStatefulSet = getStatefulSet(STATEFUL_SET_MYSQL, 1, 1, null);
        StatefulSet redisStatefulSet = getStatefulSet(STATEFUL_SET_REDIS, 1, 3, true);

        createDeployments(deploymentDailyclean, deploymentMl, deploymentEs);
        createStatefulSets(mysqlStatefulSet, redisStatefulSet);
        final String namespace = getNamespace();

        // Map
        Workload deploymentReturnedDailyclean =
                KubernetesUtils.mapWorkload(new DeploymentWrapper(deploymentDailyclean), DAILYCLEAN_LABEL_NAME);
        Workload deploymentReturnedMl =
                KubernetesUtils.mapWorkload(new DeploymentWrapper(deploymentMl), DAILYCLEAN_LABEL_NAME);
        Workload deploymentReturnedEs =
                KubernetesUtils.mapWorkload(new DeploymentWrapper(deploymentEs), DAILYCLEAN_LABEL_NAME);
        Workload mysqlStatefulSetReturned =
                KubernetesUtils.mapWorkload(new StatefulSetWrapper(mysqlStatefulSet), DAILYCLEAN_LABEL_NAME);
        Workload redisStatefulSetReturned =
                KubernetesUtils.mapWorkload(new StatefulSetWrapper(redisStatefulSet), DAILYCLEAN_LABEL_NAME);

        // Test
        assertGetStatus(namespace, STARTED, deploymentReturnedDailyclean, deploymentReturnedMl, deploymentReturnedEs,
                mysqlStatefulSetReturned, redisStatefulSetReturned);
    }

    @Test
    public void getStatusWithStateStopped() {
        // Initialize Data
        Deployment deploymentDailyclean = getDeployment(DEPLOY_DAILYCLEAN, 1, 1, false);
        Deployment deploymentMl = getDeployment(DEPLOY_ML, 0, 3, null);
        Deployment deploymentEs = getDeployment(DEPLOY_ES, 0, 2, null);

        StatefulSet mysqlStatefulSet = getStatefulSet(STATEFUL_SET_MYSQL, 1, 1, null);
        StatefulSet redisStatefulSet = getStatefulSet(STATEFUL_SET_REDIS, 0, 3, true);

        createDeployments(deploymentDailyclean, deploymentMl, deploymentEs);
        createStatefulSets(mysqlStatefulSet, redisStatefulSet);
        final String namespace = getNamespace();

        // Map
        Workload deploymentReturnedDailyclean =
                KubernetesUtils.mapWorkload(new DeploymentWrapper(deploymentDailyclean), DAILYCLEAN_LABEL_NAME);
        Workload deploymentReturnedMl =
                KubernetesUtils.mapWorkload(new DeploymentWrapper(deploymentMl), DAILYCLEAN_LABEL_NAME);
        Workload deploymentReturnedEs =
                KubernetesUtils.mapWorkload(new DeploymentWrapper(deploymentEs), DAILYCLEAN_LABEL_NAME);
        Workload mysqlStatefulSetReturned =
                KubernetesUtils.mapWorkload(new StatefulSetWrapper(mysqlStatefulSet), DAILYCLEAN_LABEL_NAME);
        Workload redisStatefulSetReturned =
                KubernetesUtils.mapWorkload(new StatefulSetWrapper(redisStatefulSet), DAILYCLEAN_LABEL_NAME);

        // Test
        assertGetStatus(namespace, STOPPED, deploymentReturnedDailyclean, deploymentReturnedMl, deploymentReturnedEs,
                mysqlStatefulSetReturned, redisStatefulSetReturned);
    }

    @Test
    public void getStatusWithStateInProgress() {
        // Initialize Data
        Deployment deploymentDailyclean = getDeployment(DEPLOY_DAILYCLEAN, 1, 1, false);
        Deployment deploymentMl = getDeployment(DEPLOY_ML, 3, 3, null);
        Deployment deploymentEs = getDeployment(DEPLOY_ES, 0, 2, null);

        StatefulSet mysqlStatefulSet = getStatefulSet(STATEFUL_SET_MYSQL, 1, 1, null);
        StatefulSet redisStatefulSet = getStatefulSet(STATEFUL_SET_REDIS, 1, 3, true);

        createDeployments(deploymentDailyclean, deploymentMl, deploymentEs);
        createStatefulSets(mysqlStatefulSet, redisStatefulSet);
        final String namespace = getNamespace();

        // Map
        Workload deploymentReturnedDailyclean =
                KubernetesUtils.mapWorkload(new DeploymentWrapper(deploymentDailyclean), DAILYCLEAN_LABEL_NAME);
        Workload deploymentReturnedMl =
                KubernetesUtils.mapWorkload(new DeploymentWrapper(deploymentMl), DAILYCLEAN_LABEL_NAME);
        Workload deploymentReturnedEs =
                KubernetesUtils.mapWorkload(new DeploymentWrapper(deploymentEs), DAILYCLEAN_LABEL_NAME);
        Workload mysqlStatefulSetReturned =
                KubernetesUtils.mapWorkload(new StatefulSetWrapper(mysqlStatefulSet), DAILYCLEAN_LABEL_NAME);
        Workload redisStatefulSetReturned =
                KubernetesUtils.mapWorkload(new StatefulSetWrapper(redisStatefulSet), DAILYCLEAN_LABEL_NAME);

        // Test
        assertGetStatus(namespace, IN_PROGRESS, deploymentReturnedDailyclean, deploymentReturnedMl,
                deploymentReturnedEs, mysqlStatefulSetReturned, redisStatefulSetReturned);
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
                .body("workloads", is(empty()));

    }

    private void assertGetStatus(String namespace,
                                 Status.StateEnum state,
                                 Workload ... workloads) {
        final ValidatableResponseOptions<ValidatableResponse, Response> response =
            given()
                .contentType(MediaType.APPLICATION_JSON)
                .when()
                .get("/status")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .body("namespace", is(namespace))
                .body("state", is(state.value()))
                .body("workloads.size()", is(workloads.length));

        Arrays.stream(workloads).forEach(workload -> {
            assertWorkload(response, workload);
        });
    }

    private static void assertWorkload(ValidatableResponseOptions<ValidatableResponse, Response> response,
                                         Workload workload) {
        String workloadId = workload.getId();
        response
                .body(getDeploymentJsonPath(workloadId, "isDailycleaned"),
                        is(workload.getIsDailycleaned()))
                .body(getDeploymentJsonPath(workloadId, "current"),
                        is(workload.getCurrent().intValue()))
                .body(getDeploymentJsonPath(workloadId, "target"),
                        is(workload.getTarget().intValue()))
                .body(getDeploymentJsonPath(workloadId, "type"),
                        is(workload.getType().value()))
                .body(getDeploymentJsonPath(workloadId, "labels"),
                        is(workload.getLabels()))
                .body(getDeploymentJsonPath(workloadId, "annotations"),
                        is(workload.getAnnotations()))
                .body(getDeploymentJsonPath(workloadId, "containers.size()"),
                        is(workload.getContainers().size()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].name"),
                        is(workload.getContainers().get(0).getName()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].image"),
                        is(workload.getContainers().get(0).getImage()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].resource_limits[0].format"),
                        is(workload.getContainers().get(0).getResourceLimits().get(0).getFormat()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].resource_limits[0].name"),
                        is(workload.getContainers().get(0).getResourceLimits().get(0).getName()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].resource_limits[0].amount"),
                        is(workload.getContainers().get(0).getResourceLimits().get(0).getAmount()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].resource_limits[0].raw_amount"),
                        is(workload.getContainers().get(0).getResourceLimits().get(0).getRawAmount()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].resource_limits[1].format"),
                        is(workload.getContainers().get(0).getResourceLimits().get(1).getFormat()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].resource_limits[1].name"),
                        is(workload.getContainers().get(0).getResourceLimits().get(1).getName()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].resource_limits[1].amount"),
                        is(workload.getContainers().get(0).getResourceLimits().get(1).getAmount()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].resource_limits[1].raw_amount"),
                        is(workload.getContainers().get(0).getResourceLimits().get(1).getRawAmount()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].resource_requests[0].format"),
                        is(workload.getContainers().get(0).getResourceRequests().get(0).getFormat()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].resource_requests[0].name"),
                        is(workload.getContainers().get(0).getResourceRequests().get(0).getName()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].resource_requests[0].amount"),
                        is(workload.getContainers().get(0).getResourceRequests().get(0).getAmount()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].resource_requests[0].raw_amount"),
                        is(workload.getContainers().get(0).getResourceRequests().get(0).getRawAmount()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].resource_requests[1].format"),
                        is(workload.getContainers().get(0).getResourceRequests().get(1).getFormat()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].resource_requests[1].name"),
                        is(workload.getContainers().get(0).getResourceRequests().get(1).getName()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].resource_requests[1].amount"),
                        is(workload.getContainers().get(0).getResourceRequests().get(1).getAmount()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].resource_requests[1].raw_amount"),
                        is(workload.getContainers().get(0).getResourceRequests().get(1).getRawAmount()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].ports[0].port"),
                        is(workload.getContainers().get(0).getPorts().get(0).getPort()))
                .body(getDeploymentJsonPath(workloadId, "containers[0].ports[0].protocol"),
                        is(workload.getContainers().get(0).getPorts().get(0).getProtocol()));
    }

    private static String getDeploymentJsonPath(final String id, final String fieldName) {
        return String.format(DEPLOYMENT_JSON_PATH, id, fieldName);
    }

    private void createDeployments(Deployment ... deployments) {
        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();
        Arrays.stream(deployments)
                .forEach(deployment -> client.apps().deployments().inNamespace(namespace).create(deployment));
    }

    private void createStatefulSets(StatefulSet ... statefulSets) {
        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();
        Arrays.stream(statefulSets)
                .forEach(statefulSet -> client.apps().statefulSets().inNamespace(namespace).create(statefulSet));
    }

    private String getNamespace() {
        KubernetesClient client = mockServer.getClient();
        return client.getNamespace();
    }

    private Deployment getDeployment(String name, int readyReplicas, int replicas, Boolean dailycleaned) {
        Deployment deployment = new Deployment();
        deployment.setMetadata(new ObjectMeta());
        deployment.getMetadata().setName(name);
        deployment.getMetadata().setLabels(new HashMap<>());
        deployment.getMetadata().getLabels().put("name", name);
        if(dailycleaned != null) {
            deployment.getMetadata().getLabels().put(DAILYCLEAN_LABEL_NAME, dailycleaned.toString());
        }
        DeploymentStatus deploymentStatus = new DeploymentStatus();
        deploymentStatus.setReplicas(replicas);
        deploymentStatus.setReadyReplicas(readyReplicas);
        deployment.setStatus(deploymentStatus);

        DeploymentSpec spec = new DeploymentSpec();
        spec.setTemplate(getPodTemplateSpecWithContainer());
        deployment.setSpec(spec);

        return deployment;
    }

    private StatefulSet getStatefulSet(String name, int readyReplicas, int replicas, Boolean dailycleaned) {
        StatefulSet statefuleSet = new StatefulSet();
        statefuleSet.setMetadata(new ObjectMeta());
        statefuleSet.getMetadata().setName(name);
        statefuleSet.getMetadata().setLabels(new HashMap<>());
        statefuleSet.getMetadata().getLabels().put("name", name);
        if(dailycleaned != null) {
            statefuleSet.getMetadata().getLabels().put(DAILYCLEAN_LABEL_NAME, dailycleaned.toString());
        }
        StatefulSetStatus status = new StatefulSetStatus();
        statefuleSet.setStatus(status);
        status.setReadyReplicas(readyReplicas);
        status.setReplicas(replicas);

        StatefulSetSpec spec = new StatefulSetSpec();
        spec.setTemplate(getPodTemplateSpecWithContainer());
        statefuleSet.setSpec(spec);

        return statefuleSet;
    }

    private PodTemplateSpec getPodTemplateSpecWithContainer() {
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

        ResourceRequirements resourceRequirements = new ResourceRequirements();
        resourceRequirements.setLimits(new HashMap<>());
        resourceRequirements.getLimits().put("cpu", new Quantity("10"));
        resourceRequirements.getLimits().put("memory", new Quantity("748", "Mi"));
        resourceRequirements.setRequests(new HashMap<>());
        resourceRequirements.getRequests().put("cpu", new Quantity("1", "m"));
        resourceRequirements.getRequests().put("memory", new Quantity("1024", "Mi"));
        container.setResources(resourceRequirements);

        return templateSpec;
    }
}
