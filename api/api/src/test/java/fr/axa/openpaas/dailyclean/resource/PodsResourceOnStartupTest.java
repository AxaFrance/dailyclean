package fr.axa.openpaas.dailyclean.resource;

import fr.axa.openpaas.dailyclean.util.KubernetesUtils;
import io.fabric8.kubernetes.api.model.batch.v1.CronJob;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.server.mock.KubernetesServer;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.kubernetes.client.KubernetesTestServer;
import io.quarkus.test.kubernetes.client.WithKubernetesTestServer;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.util.List;

import static fr.axa.openpaas.dailyclean.service.KubernetesArgument.STOP;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;

@WithKubernetesTestServer
@QuarkusTest
class PodsResourceOnStartupTest {
    protected static final String CRON_10_00 = "0 10 * * *";

    @Inject
    PodsResource podsResource;

    @KubernetesTestServer
    KubernetesServer mockServer;

    @BeforeEach
    public void before() {
        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();
        client.batch().v1().cronjobs().inNamespace(namespace).delete();
    }

    @Test
    void shouldCreateCronStopJobWithDefaultWhenItNotExists() {
        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();

        String stopCronJobName = KubernetesUtils.getCronName(STOP);
        String cronStop = "0 18 * * *";

        podsResource.onStart(null);

        List<CronJob> cronJobs = client.batch().v1().cronjobs().inNamespace(namespace).list().getItems();
        assertThat(cronJobs.size(), is(1));

        cronJobs.forEach(cronJob -> {
            assertThat(cronJob.getSpec().getSchedule(), is(cronStop));
            assertThat(cronJob.getMetadata().getName(), is(stopCronJobName));
        });
    }

    @Test
    void shouldNotCreateCronStopJobWithDefaultWhenItNotExists() {
        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();

        createCronJobStop(client, namespace);

        podsResource.onStart(null);

        List<CronJob> cronJobs = client.batch().v1().cronjobs().inNamespace(namespace).list().getItems();
        assertThat(cronJobs.size(), is(1));

        cronJobs.forEach(cronJob -> {
            assertThat(cronJob.getSpec().getSchedule(), is(CRON_10_00));
        });
    }

    private static void createCronJobStop(KubernetesClient client, String namespace) {
        InputStream cronJobAsInputStream =
                KubernetesUtils.createCronJobAsInputStream(STOP, CRON_10_00, "imagename:1.0.0", "default", "UTC");
        client.load(cronJobAsInputStream).inNamespace(namespace).createOrReplace();
    }
}