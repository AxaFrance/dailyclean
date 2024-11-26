package fr.axa.openpaas.dailyclean.resource;

import fr.axa.openpaas.dailyclean.util.KubernetesUtils;
import io.fabric8.kubernetes.api.model.Container;
import io.fabric8.kubernetes.api.model.batch.v1.CronJob;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.kubernetes.client.WithKubernetesTestServer;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.util.List;

import static fr.axa.openpaas.dailyclean.service.KubernetesArgument.START;
import static fr.axa.openpaas.dailyclean.service.KubernetesArgument.STOP;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;

@WithKubernetesTestServer
@QuarkusTest
public class TimeRangesResourceOnStartupTest extends AbstractTimeRangesResourceTest {

    @Inject
    TimeRangesResource resource;

    @Test
    public void shouldUpdateTheImageVersionOnStartup() {
        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();

        // Create cron jobs with old versions
        InputStream cronJobStart =
                KubernetesUtils.createCronJobAsInputStream(START, CRON_10_00, OLD_IMAGE_NAME, SERVICE_ACCOUNT_NAME, TIME_ZONE);
        InputStream cronJobStop =
                KubernetesUtils.createCronJobAsInputStream(STOP, CRON_10_00, OLD_IMAGE_NAME, SERVICE_ACCOUNT_NAME, TIME_ZONE);

        client.load(cronJobStart).inNamespace(namespace).createOrReplace();
        client.load(cronJobStop).inNamespace(namespace).createOrReplace();

        resource.onStart(null);

        List<CronJob> cronJobs = client.batch().v1().cronjobs().inNamespace(namespace).list().getItems();
        assertThat(cronJobs.size(), is(2));

        cronJobs.forEach(cronJob -> {
            Container container = cronJob.getSpec()
                    .getJobTemplate()
                    .getSpec()
                    .getTemplate()
                    .getSpec()
                    .getContainers()
                    .stream().findFirst().orElseThrow();

            assertThat(container.getImage(), is(IMG_NAME));
        });
    }

    @Test
    public void shouldUpdateTheImageVersionOnStartupOnlyIfStartExisted() {
        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();

        String startCronJobName = KubernetesUtils.getCronName(START);
        String cronStart = CRON_10_00;


        // Create cron jobs with old versions
        InputStream cronJobStart =
                KubernetesUtils.createCronJobAsInputStream(START, cronStart, OLD_IMAGE_NAME, SERVICE_ACCOUNT_NAME, TIME_ZONE);

        client.load(cronJobStart).inNamespace(namespace).createOrReplace();

        resource.onStart(null);

        List<CronJob> cronJobs = client.batch().v1().cronjobs().inNamespace(namespace).list().getItems();
        assertThat(cronJobs.size(), is(1));

        cronJobs.forEach(cronJob -> {
            Container container = cronJob.getSpec()
                    .getJobTemplate()
                    .getSpec()
                    .getTemplate()
                    .getSpec()
                    .getContainers()
                    .stream().findFirst().orElseThrow();

            assertThat(container.getImage(), is(IMG_NAME));
            assertThat(cronJob.getSpec().getSchedule(), is(cronStart));
            assertThat(cronJob.getMetadata().getName(), is(startCronJobName));
        });
    }

    @Test
    public void shouldUpdateTheImageVersionOnStartupOnlyIfStopExisted() {
        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();

        String stopCronJobName = KubernetesUtils.getCronName(STOP);
        String cronStop = CRON_10_00;


        // Create cron jobs with old versions
        InputStream cronJobStop =
                KubernetesUtils.createCronJobAsInputStream(STOP, cronStop, OLD_IMAGE_NAME, SERVICE_ACCOUNT_NAME, TIME_ZONE);

        client.load(cronJobStop).inNamespace(namespace).createOrReplace();

        resource.onStart(null);

        List<CronJob> cronJobs = client.batch().v1().cronjobs().inNamespace(namespace).list().getItems();
        assertThat(cronJobs.size(), is(1));

        cronJobs.forEach(cronJob -> {
            Container container = cronJob.getSpec()
                    .getJobTemplate()
                    .getSpec()
                    .getTemplate()
                    .getSpec()
                    .getContainers()
                    .stream().findFirst().orElseThrow();

            assertThat(container.getImage(), is(IMG_NAME));
            assertThat(cronJob.getSpec().getSchedule(), is(cronStop));
            assertThat(cronJob.getMetadata().getName(), is(stopCronJobName));
        });
    }
}
