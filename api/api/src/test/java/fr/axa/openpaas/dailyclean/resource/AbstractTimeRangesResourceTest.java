package fr.axa.openpaas.dailyclean.resource;

import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.server.mock.KubernetesServer;
import io.quarkus.test.kubernetes.client.KubernetesTestServer;
import org.junit.jupiter.api.BeforeEach;

public abstract class AbstractTimeRangesResourceTest {

    protected static final String OLD_IMAGE_NAME = "imagename:1.0.0";
    protected static final String TIMERANGES_URI = "/timeranges";
    protected static final String CRON_START = "cron_start";
    protected static final String CRON_STOP = "cron_stop";
    protected static final String CRON_9_00 = "0 9 * * *";
    protected static final String CRON_19_00 = "0 19 * * *";
    protected static final String CRON_10_00 = "0 10 * * *";
    protected static final String CRON_20_00 = "0 20 * * *";
    protected static final String IMG_NAME = "axaguildev/dailyclean-job:latest";
    protected static final String SERVICE_ACCOUNT_NAME = "default";

    @KubernetesTestServer
    KubernetesServer mockServer;

    @BeforeEach
    public void before() {
        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();
        client.batch().v1().cronjobs().inNamespace(namespace).delete();
    }

}
