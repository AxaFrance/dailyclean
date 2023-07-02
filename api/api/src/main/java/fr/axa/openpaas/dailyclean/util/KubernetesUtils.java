package fr.axa.openpaas.dailyclean.util;

import static fr.axa.openpaas.dailyclean.util.ScriptPlaceholder.*;

import fr.axa.openpaas.dailyclean.model.Container;
import fr.axa.openpaas.dailyclean.model.Deployment;
import fr.axa.openpaas.dailyclean.model.Port;
import fr.axa.openpaas.dailyclean.model.Resource;
import fr.axa.openpaas.dailyclean.service.KubernetesArgument;
import io.fabric8.kubernetes.api.model.ContainerPort;
import io.fabric8.kubernetes.api.model.PodTemplateSpec;
import io.fabric8.kubernetes.api.model.Quantity;
import io.fabric8.kubernetes.api.model.apps.DeploymentSpec;
import org.apache.commons.lang3.BooleanUtils;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public final class KubernetesUtils {

    public static final String CRON_JOB_NAME = "dailyclean";
    public static final String JOB_NAME = "dailyclean-job";

    private KubernetesUtils() {}

    /**
     * Create a Cronjob from template of the script
     * @param argument Define if it is a start or stop Cronjob
     * @param cron The cron to set
     * @param imgName The docker image of the job
     * @return The cronjob script as an @{@link InputStream}
     */
    public static InputStream createCronJobAsInputStream(KubernetesArgument argument,
                                                         String cron,
                                                         String imgName,
                                                         String serviceAccountName) {
        String text = getFileAsString("scripts/cronjob.yml");
        String cronJobAsdString = text.replace(NAME.getPlaceholder(), getCronName(argument))
                .replace(ARGUMENT.getPlaceholder(), argument.getValue())
                .replace(SCHEDULE.getPlaceholder(), cron)
                .replace(IMG_NAME.getPlaceholder(), imgName)
                .replace(SERVICE_ACCOUNT_NAME.getPlaceholder(), serviceAccountName);

        return new ByteArrayInputStream(cronJobAsdString.getBytes());
    }

    /**
     * Create a Job from a template of the script
     * @param argument Define if it is a start or stop Cronjob
     * @param imgName The docker image of the job
     * @return The cronjob script as an @{@link InputStream}
     */
    public static InputStream createJobAsInputStream(KubernetesArgument argument,
                                                     String imgName,
                                                     String serviceAccountName) {
        String text = getFileAsString("scripts/job.yml");
        String cronJobAsdString = text.replace(NAME.getPlaceholder(), getJobName(argument))
                .replace(ARGUMENT.getPlaceholder(), argument.getValue())
                .replace(IMG_NAME.getPlaceholder(), imgName)
                .replace(SERVICE_ACCOUNT_NAME.getPlaceholder(), serviceAccountName);

        return new ByteArrayInputStream(cronJobAsdString.getBytes());
    }

    public static String getCronName(KubernetesArgument argument) {
        return getName(argument, CRON_JOB_NAME);
    }
    public static String getJobName(KubernetesArgument argument) {
        return getName(argument, JOB_NAME);
    }

    public static Deployment mapDeployment(io.fabric8.kubernetes.api.model.apps.Deployment deployment,
                                           String dailycleanLabelName) {
        Deployment res = new Deployment();
        res.setId(deployment.getMetadata().getName());
        if(deployment.getStatus() != null) {
            int replicas = deployment.getStatus().getReplicas() != null ? deployment.getStatus().getReplicas() : 0;
            int current =
                    deployment.getStatus().getReadyReplicas() != null ? deployment.getStatus().getReadyReplicas() : 0;
            res.setTarget(BigDecimal.valueOf(replicas));
            res.setCurrent(BigDecimal.valueOf(current));
        }

        Boolean dailycleaned = null;
        if(deployment.getMetadata().getLabels() != null) {
            Map<String, String> labels = deployment.getMetadata().getLabels();
            dailycleaned = BooleanUtils.toBooleanObject(labels.get(dailycleanLabelName));
            res.setLabels(new HashMap<>(labels));
        }
        res.setIsDailycleaned(dailycleaned == null || dailycleaned);

        DeploymentSpec spec = deployment.getSpec();
        if(spec != null) {
            PodTemplateSpec templateSpec = spec.getTemplate();
            if(templateSpec != null && templateSpec.getSpec() != null
                    && templateSpec.getSpec().getContainers() != null) {
                res.setContainers(templateSpec.getSpec().getContainers().stream()
                        .map(KubernetesUtils::mapContainer)
                        .collect(Collectors.toList()));
            }
        }
        return res;
    }

    private static Container mapContainer(io.fabric8.kubernetes.api.model.Container container) {
        Container res = new Container();
        res.setImage(container.getImage());
        res.setName(container.getName());
        List<Port> ports = container.getPorts().stream()
                .map(KubernetesUtils::mapPort)
                .collect(Collectors.toList());
        res.setPorts(ports);
        if(container.getResources() != null) {
            if(container.getResources().getLimits() != null) {
                List<Resource> resources = container.getResources().getLimits().entrySet().stream()
                        .map(entry -> mapResource(entry.getKey(), entry.getValue()))
                        .collect(Collectors.toList());
                res.setResourceLimits(resources);
            }
            if(container.getResources().getRequests() != null) {
                List<Resource> resources = container.getResources().getRequests().entrySet().stream()
                        .map(entry -> mapResource(entry.getKey(), entry.getValue()))
                        .collect(Collectors.toList());
                res.setResourceRequests(resources);
            }
        }

        return res;
    }

    private static Resource mapResource(String name, Quantity quantity) {
        Resource resource = new Resource();
        resource.setName(name);
        resource.setRawAmount(quantity.getAmount());
        Integer amount;
        try {
            amount = Integer.parseInt(quantity.getAmount());
        } catch (NumberFormatException e) {
            amount = null;
        }
        resource.setAmount(amount);
        resource.setFormat(quantity.getFormat());
        return resource;
    }

    private static Port mapPort(ContainerPort containerPort) {
        Port port = new Port();
        port.setPort(containerPort.getContainerPort());
        port.setProtocol(containerPort.getProtocol());
        return port;
    }

    private static String getName(KubernetesArgument argument, String name) {
        return String.format("%s-%s", name, argument.getValue());
    }

    private static String getFileAsString(String s) {
        ClassLoader classLoader = KubernetesUtils.class.getClassLoader();
        InputStream inputStream = classLoader.getResourceAsStream(s);
        assert inputStream != null;
        return new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))
                .lines()
                .collect(Collectors.joining(System.lineSeparator()));
    }
}
