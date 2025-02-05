package fr.axa.openpaas.dailyclean.resource;

import fr.axa.openpaas.dailyclean.model.TimeRange;
import fr.axa.openpaas.dailyclean.util.KubernetesUtils;
import io.fabric8.kubernetes.api.model.batch.v1.CronJob;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.kubernetes.client.WithKubernetesTestServer;
import jakarta.ws.rs.core.MediaType;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.util.List;

import static fr.axa.openpaas.dailyclean.service.KubernetesArgument.START;
import static fr.axa.openpaas.dailyclean.service.KubernetesArgument.STOP;
import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.MatcherAssert.assertThat;

@WithKubernetesTestServer
@QuarkusTest
public class TimeRangesResourceTest extends AbstractTimeRangesResourceTest {



    @Test
    public void shouldCreateCronJobs() {
        String cronStart = CRON_9_00;
        String cronStop = CRON_19_00;

        TimeRange timeRange = new TimeRange();
        timeRange.setCronStart(cronStart);
        timeRange.setCronStop(cronStop);
        given()
                .contentType(MediaType.APPLICATION_JSON)
                .when().body(timeRange)
                .post(TIMERANGES_URI)
                .then()
                .statusCode(HttpStatus.SC_OK)
                .body(CRON_START, is(cronStart))
                .body(CRON_STOP, is(cronStop));

        assertThatCronJobsExist(cronStart, cronStop);
    }

    @Test
    public void shouldReturn400WhenCronAreNotSet() {
        given()
                .contentType(MediaType.APPLICATION_JSON)
                .when()
                .post(TIMERANGES_URI)
                .then()
                .statusCode(HttpStatus.SC_BAD_REQUEST);
    }

    @Test
    public void shouldGetTimeRanges() {
        String cronStart = CRON_10_00;
        String cronStop = CRON_20_00;

        initializeExistingCronJobs(cronStart, cronStop, false);

        given()
                .contentType(MediaType.APPLICATION_JSON)
                .when()
                .get(TIMERANGES_URI)
                .then()
                .statusCode(HttpStatus.SC_OK)
                .body(CRON_START, is(cronStart))
                .body(CRON_STOP, is(cronStop));
    }

    @Test
    public void shouldReturn200WithEmptyTimerangesWhenNoTimeRangeIsSet() {
        given()
                .contentType(MediaType.APPLICATION_JSON)
                .when()
                .get(TIMERANGES_URI)
                .then()
                .statusCode(HttpStatus.SC_OK)
                .body(CRON_START, is(nullValue()))
                .body(CRON_STOP, is(nullValue()));
    }

    @Test
    public void shouldGetTimeRangesWhenAllExistingCronJobHasBeenSuspendState() {
        String cronStart = CRON_10_00;
        String cronStop = CRON_20_00;

        initializeExistingCronJobs(cronStart, cronStop, true);

        given()
                .contentType(MediaType.APPLICATION_JSON)
                .when()
                .get(TIMERANGES_URI)
                .then()
                .statusCode(HttpStatus.SC_OK)
                .body(CRON_START, is(nullValue()))
                .body(CRON_STOP, is(nullValue()));
    }

    @Test
    public void shouldNotDeleteCronJobsIfTimeRangesAreNotSet() {
        String cronStart = CRON_10_00;
        String cronStop = CRON_20_00;

        initializeExistingCronJobs(cronStart, cronStop, false);

        given()
                .contentType(MediaType.APPLICATION_JSON)
                .when()
                .post(TIMERANGES_URI)
                .then()
                .statusCode(HttpStatus.SC_BAD_REQUEST);

        assertThatCronJobsExist(cronStart, cronStop);
    }

    @Test
    public void shouldUpsertExistingTimerangesWithNewOnes() {
        String cronStart = CRON_10_00;
        String cronStop = CRON_20_00;

        initializeExistingCronJobs(cronStart, cronStop, false);

        String newCronStart = CRON_9_00;

        TimeRange timeRange = new TimeRange();
        timeRange.setCronStart(newCronStart);
        given()
                .contentType(MediaType.APPLICATION_JSON)
                .when().body(timeRange)
                .post(TIMERANGES_URI)
                .then()
                .statusCode(HttpStatus.SC_OK)
                .body(CRON_START, is(newCronStart))
                .body(CRON_STOP, is(nullValue()));

        KubernetesClient client = mockServer.getClient();

        final String namespace = client.getNamespace();
        List<CronJob> cronJobs = client.batch().v1().cronjobs().inNamespace(namespace).list().getItems();
        assertThat(cronJobs.size(), is(2));

        CronJob startCronJob = findCronJobWithName(KubernetesUtils.getCronName(START), client);
        CronJob stopCronJob = findCronJobWithName(KubernetesUtils.getCronName(STOP), client);

        assertThat(startCronJob.getMetadata().getName(), is(KubernetesUtils.getCronName(START)));
        assertThat(startCronJob.getSpec().getSchedule(), is(newCronStart));
        assertThat(startCronJob.getSpec().getSuspend(), is(false));
        assertThat(stopCronJob.getMetadata().getName(), is(KubernetesUtils.getCronName(STOP)));
        assertThat(stopCronJob.getSpec().getSchedule(), is(DEFAULT_SUSPENDED_CRON));
        assertThat(stopCronJob.getSpec().getSuspend(), is(true));
    }

    @Test
    public void shouldUpsertExistingTimerangeWithNewOneAndCreate() {
        String cronStart = CRON_10_00;

        InputStream cronJobStart = KubernetesUtils.createCronJobAsInputStream(START, cronStart, IMG_NAME, SERVICE_ACCOUNT_NAME, TIME_ZONE, false);

        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();
        client.load(cronJobStart).inNamespace(namespace).createOrReplace();

        String newCronStart = CRON_9_00;
        String newCronStop = CRON_20_00;

        TimeRange timeRange = new TimeRange();
        timeRange.setCronStart(newCronStart);
        timeRange.setCronStop(newCronStop);
        given()
                .contentType(MediaType.APPLICATION_JSON)
                .when().body(timeRange)
                .post(TIMERANGES_URI)
                .then()
                .statusCode(HttpStatus.SC_OK)
                .body(CRON_START, is(newCronStart))
                .body(CRON_STOP, is(newCronStop));

        assertThatCronJobsExist(newCronStart, newCronStop);
    }



    private void initializeExistingCronJobs(String cronStart, String cronStop, Boolean suspend) {
        InputStream cronJobStart = KubernetesUtils.createCronJobAsInputStream(START, cronStart, IMG_NAME, SERVICE_ACCOUNT_NAME, TIME_ZONE, suspend);
        InputStream cronJobStop = KubernetesUtils.createCronJobAsInputStream(STOP, cronStop, IMG_NAME, SERVICE_ACCOUNT_NAME, TIME_ZONE, suspend);

        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();
        client.load(cronJobStart).inNamespace(namespace).createOrReplace();
        client.load(cronJobStop).inNamespace(namespace).createOrReplace();
    }

    private void assertThatCronJobsExist(String cronStart, String cronStop) {
        KubernetesClient client = mockServer.getClient();

        final String namespace = client.getNamespace();
        List<CronJob> cronJobs = client.batch().v1().cronjobs().inNamespace(namespace).list().getItems();
        assertThat(cronJobs.size(), is(2));

        String startCronJobName = KubernetesUtils.getCronName(START);
        String stopCronJobName = KubernetesUtils.getCronName(STOP);

        cronJobs.forEach(cronJob -> {
            assertThat(cronJob.getSpec().getSchedule(), anyOf(is(cronStart), is(cronStop)));
            assertThat(cronJob.getMetadata().getName(), anyOf(is(startCronJobName), is(stopCronJobName)));
        });
    }

    private CronJob findCronJobWithName(final String cronJobName, final KubernetesClient client) {
        return client.batch().v1().cronjobs().inNamespace(client.getNamespace()).withName(cronJobName).get();
    }
}
