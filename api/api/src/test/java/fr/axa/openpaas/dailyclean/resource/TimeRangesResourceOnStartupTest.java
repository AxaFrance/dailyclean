package fr.axa.openpaas.dailyclean.resource;

import fr.axa.openpaas.dailyclean.util.KubernetesUtils;
import io.fabric8.kubernetes.api.model.Container;
import io.fabric8.kubernetes.api.model.batch.v1.CronJob;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.kubernetes.client.WithKubernetesTestServer;
import jakarta.inject.Inject;
import org.junit.jupiter.api.DisplayName;
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
                KubernetesUtils.createCronJobAsInputStream(START, CRON_10_00, OLD_IMAGE_NAME, SERVICE_ACCOUNT_NAME, TIME_ZONE, false);
        InputStream cronJobStop =
                KubernetesUtils.createCronJobAsInputStream(STOP, CRON_10_00, OLD_IMAGE_NAME, SERVICE_ACCOUNT_NAME, TIME_ZONE, false);

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
    @DisplayName("onStart() should update the image version of all CronJob if CronJob start already existed and set the CronJob stop to suspended state")
    public void shouldUpdateTheImageVersionOnStartupOnlyIfStartExisted_AndSetStopCronJobInSuspendedState() {
        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();

        String startCronJobName = KubernetesUtils.getCronName(START);
        String cronStart = CRON_10_00;

        // Create cron jobs with old versions
        InputStream cronJobStart =
                KubernetesUtils.createCronJobAsInputStream(START, cronStart, OLD_IMAGE_NAME, SERVICE_ACCOUNT_NAME, TIME_ZONE, false);

        client.load(cronJobStart).inNamespace(namespace).createOrReplace();

        resource.onStart(null);

        List<CronJob> cronJobs = client.batch().v1().cronjobs().inNamespace(namespace).list().getItems();
        assertThat(cronJobs.size(), is(2));

        CronJob startCronJob = findCronJobWithName(KubernetesUtils.getCronName(START), client);
        CronJob stoptCronJob = findCronJobWithName(KubernetesUtils.getCronName(STOP), client);
        Container startContainer = startCronJob.getSpec().getJobTemplate().getSpec().getTemplate().getSpec().getContainers().stream().findFirst().orElseThrow();
        Container stopContainer = stoptCronJob.getSpec().getJobTemplate().getSpec().getTemplate().getSpec().getContainers().stream().findFirst().orElseThrow();

        assertThat(startContainer.getImage(), is(IMG_NAME));
        assertThat(startCronJob.getSpec().getSchedule(), is(cronStart));
        assertThat(startCronJob.getSpec().getSuspend(), is(false));
        assertThat(startCronJob.getMetadata().getName(), is(startCronJobName));

        assertThat(stopContainer.getImage(), is(IMG_NAME));
        assertThat(stoptCronJob.getSpec().getSchedule(), is(DEFAULT_SUSPENDED_CRON));
        assertThat(stoptCronJob.getSpec().getSuspend(), is(true));
        assertThat(stoptCronJob.getMetadata().getName(), is(KubernetesUtils.getCronName(STOP)));
    }

    @Test
    @DisplayName("onStart() should update the image version of all CronJob if CronJob stop already existed and set the CronJob start to suspended state")
    public void shouldUpdateTheImageVersionOnStartupOnlyIfStopExisted_AndSetStartCronJobInSuspendedState() {
        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();

        String stopCronJobName = KubernetesUtils.getCronName(STOP);
        String cronStop = CRON_10_00;

        // Create cron jobs with old versions
        InputStream cronJobStop =
                KubernetesUtils.createCronJobAsInputStream(STOP, cronStop, OLD_IMAGE_NAME, SERVICE_ACCOUNT_NAME, TIME_ZONE, false);

        client.load(cronJobStop).inNamespace(namespace).createOrReplace();

        resource.onStart(null);

        List<CronJob> cronJobs = client.batch().v1().cronjobs().inNamespace(namespace).list().getItems();
        assertThat(cronJobs.size(), is(2));

        CronJob startCronJob = findCronJobWithName(KubernetesUtils.getCronName(START), client);
        CronJob stoptCronJob = findCronJobWithName(KubernetesUtils.getCronName(STOP), client);
        Container startContainer = startCronJob.getSpec().getJobTemplate().getSpec().getTemplate().getSpec().getContainers().stream().findFirst().orElseThrow();
        Container stopContainer = stoptCronJob.getSpec().getJobTemplate().getSpec().getTemplate().getSpec().getContainers().stream().findFirst().orElseThrow();

        assertThat(startContainer.getImage(), is(IMG_NAME));
        assertThat(startCronJob.getSpec().getSchedule(), is(DEFAULT_SUSPENDED_CRON));
        assertThat(startCronJob.getSpec().getSuspend(), is(true));
        assertThat(startCronJob.getMetadata().getName(), is(KubernetesUtils.getCronName(START)));

        assertThat(stopContainer.getImage(), is(IMG_NAME));
        assertThat(stoptCronJob.getSpec().getSchedule(), is(cronStop));
        assertThat(stoptCronJob.getSpec().getSuspend(), is(false));
        assertThat(stoptCronJob.getMetadata().getName(), is(stopCronJobName));
    }

    @Test
    @DisplayName("onStart() should update the image version of all CronJob when existing Cronjob start and stop is in suspended state")
    public void shouldUpdateTheImageVersionOnStartup_WhenExistingStartAndStopCronJobIsInSuspendedState() {
        KubernetesClient client = mockServer.getClient();
        String namespace = client.getNamespace();

        String startCronJobName = KubernetesUtils.getCronName(START);
        String stopCronJobName = KubernetesUtils.getCronName(STOP);

        // Create cron jobs with old versions
        InputStream cronJobStart =
                KubernetesUtils.createCronJobAsInputStream(START, DEFAULT_SUSPENDED_CRON, OLD_IMAGE_NAME, SERVICE_ACCOUNT_NAME, TIME_ZONE, true);

        InputStream cronJobStop =
                KubernetesUtils.createCronJobAsInputStream(STOP, DEFAULT_SUSPENDED_CRON, OLD_IMAGE_NAME, SERVICE_ACCOUNT_NAME, TIME_ZONE, true);

        client.load(cronJobStart).inNamespace(namespace).createOrReplace();
        client.load(cronJobStop).inNamespace(namespace).createOrReplace();

        resource.onStart(null);

        List<CronJob> cronJobs = client.batch().v1().cronjobs().inNamespace(namespace).list().getItems();
        assertThat(cronJobs.size(), is(2));

        CronJob startCronJob = findCronJobWithName(KubernetesUtils.getCronName(START), client);
        CronJob stoptCronJob = findCronJobWithName(KubernetesUtils.getCronName(STOP), client);
        Container startContainer = startCronJob.getSpec().getJobTemplate().getSpec().getTemplate().getSpec().getContainers().stream().findFirst().orElseThrow();
        Container stopContainer = stoptCronJob.getSpec().getJobTemplate().getSpec().getTemplate().getSpec().getContainers().stream().findFirst().orElseThrow();

        assertThat(startContainer.getImage(), is(IMG_NAME));
        assertThat(startCronJob.getSpec().getSchedule(), is(DEFAULT_SUSPENDED_CRON));
        assertThat(startCronJob.getSpec().getSuspend(), is(true));
        assertThat(startCronJob.getMetadata().getName(), is(startCronJobName));

        assertThat(stopContainer.getImage(), is(IMG_NAME));
        assertThat(stoptCronJob.getSpec().getSchedule(), is(DEFAULT_SUSPENDED_CRON));
        assertThat(stoptCronJob.getSpec().getSuspend(), is(true));
        assertThat(stoptCronJob.getMetadata().getName(), is(stopCronJobName));
    }

    private CronJob findCronJobWithName(final String cronJobName, final KubernetesClient client) {
        return client.batch().v1().cronjobs().inNamespace(client.getNamespace()).withName(cronJobName).get();
    }
}
