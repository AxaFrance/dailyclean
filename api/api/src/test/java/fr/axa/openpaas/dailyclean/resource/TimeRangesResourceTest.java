package fr.axa.openpaas.dailyclean.resource;

import fr.axa.openpaas.dailyclean.model.TimeRange;
import io.fabric8.kubernetes.api.model.batch.CronJob;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.server.mock.KubernetesServer;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.kubernetes.client.KubernetesTestServer;
import io.quarkus.test.kubernetes.client.WithKubernetesTestServer;
import fr.axa.openpaas.dailyclean.util.KubernetesUtils;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.ws.rs.core.MediaType;
import java.io.InputStream;
import java.util.List;

import static io.restassured.RestAssured.given;
import static fr.axa.openpaas.dailyclean.service.KubernetesArgument.START;
import static fr.axa.openpaas.dailyclean.service.KubernetesArgument.STOP;
import static org.hamcrest.CoreMatchers.anyOf;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.nullValue;
import static org.hamcrest.MatcherAssert.assertThat;

@WithKubernetesTestServer
@QuarkusTest
public class TimeRangesResourceTest {

    @KubernetesTestServer
    KubernetesServer mockServer;

    @BeforeEach
    public void before() {
        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();
        client.batch().cronjobs().inNamespace(namespace).delete();
    }

    @Test
    public void shouldCreateCronJobs() {
        String cronStart = "0 9 * * *";
        String cronStop = "0 19 * * *";

        TimeRange timeRange = new TimeRange();
        timeRange.setCronStart(cronStart);
        timeRange.setCronStop(cronStop);
        given()
                .contentType(MediaType.APPLICATION_JSON)
                .when().body(timeRange)
                .post("/timeranges")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .body("cron_start", is(cronStart))
                .body("cron_stop", is(cronStop));

        assertThatCronJobsExist(cronStart, cronStop);
    }

    @Test
    public void shouldReturn400WhenCronAreNotSet() {
        given()
                .contentType(MediaType.APPLICATION_JSON)
                .when()
                .post("/timeranges")
                .then()
                .statusCode(HttpStatus.SC_BAD_REQUEST);
    }

    @Test
    public void shouldGetTimeRanges() {
        String cronStart = "0 10 * * *";
        String cronStop = "0 20 * * *";

        initializeExistingCronJobs(cronStart, cronStop);

        given()
                .contentType(MediaType.APPLICATION_JSON)
                .when()
                .get("/timeranges")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .body("cron_start", is(cronStart))
                .body("cron_stop", is(cronStop));
    }

    @Test
    public void shouldReturn200WithEmptyTimerangesWhenNoTimeRangeIsSet() {
        given()
                .contentType(MediaType.APPLICATION_JSON)
                .when()
                .get("/timeranges")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .body("cron_start", is(nullValue()))
                .body("cron_stop", is(nullValue()));
    }

    @Test
    public void shouldNotDeleteCronJobsIfTimeRangesAreNotSet() {
        String cronStart = "0 10 * * *";
        String cronStop = "0 20 * * *";

        initializeExistingCronJobs(cronStart, cronStop);

        given()
                .contentType(MediaType.APPLICATION_JSON)
                .when()
                .post("/timeranges")
                .then()
                .statusCode(HttpStatus.SC_BAD_REQUEST);

        assertThatCronJobsExist(cronStart, cronStop);
    }

    @Test
    public void shouldUpsertExistingTimerangesWithNewOnes() {
        String cronStart = "0 10 * * *";
        String cronStop = "0 20 * * *";

        initializeExistingCronJobs(cronStart, cronStop);

        String newCronStart = "0 9 * * *";

        TimeRange timeRange = new TimeRange();
        timeRange.setCronStart(newCronStart);
        given()
                .contentType(MediaType.APPLICATION_JSON)
                .when().body(timeRange)
                .post("/timeranges")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .body("cron_start", is(newCronStart))
                .body("cron_stop", is(nullValue()));

        KubernetesClient client = mockServer.getClient();

        final String namespace = client.getNamespace();
        List<CronJob> cronJobs = client.batch().cronjobs().inNamespace(namespace).list().getItems();
        assertThat(cronJobs.size(), is(1));

        CronJob cronJob = cronJobs.get(0);
        assertThat(cronJob.getMetadata().getName(), is(KubernetesUtils.getCronName(START)));
        assertThat(cronJob.getSpec().getSchedule(), is(newCronStart));
    }

    @Test
    public void shouldUpsertExistingTimerangeWithNewOneAndCreate() {
        String cronStart = "0 10 * * *";

        InputStream cronJobStart = KubernetesUtils.createCronJobAsInputStream(START, cronStart, "imgName");

        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();
        client.load(cronJobStart).inNamespace(namespace).createOrReplace();

        String newCronStart = "0 9 * * *";
        String newCronStop = "0 20 * * *";

        TimeRange timeRange = new TimeRange();
        timeRange.setCronStart(newCronStart);
        timeRange.setCronStop(newCronStop);
        given()
                .contentType(MediaType.APPLICATION_JSON)
                .when().body(timeRange)
                .post("/timeranges")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .body("cron_start", is(newCronStart))
                .body("cron_stop", is(newCronStop));

        assertThatCronJobsExist(newCronStart, newCronStop);
    }

    private void initializeExistingCronJobs(String cronStart, String cronStop) {
        InputStream cronJobStart = KubernetesUtils.createCronJobAsInputStream(START, cronStart, "imgName");
        InputStream cronJobStop = KubernetesUtils.createCronJobAsInputStream(STOP, cronStop, "imgName");

        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();
        client.load(cronJobStart).inNamespace(namespace).createOrReplace();
        client.load(cronJobStop).inNamespace(namespace).createOrReplace();
    }

    private void assertThatCronJobsExist(String cronStart, String cronStop) {
        KubernetesClient client = mockServer.getClient();

        final String namespace = client.getNamespace();
        List<CronJob> cronJobs = client.batch().cronjobs().inNamespace(namespace).list().getItems();
        assertThat(cronJobs.size(), is(2));

        String startCronJobName = KubernetesUtils.getCronName(START);
        String stopCronJobName = KubernetesUtils.getCronName(STOP);

        cronJobs.forEach(cronJob -> {
            assertThat(cronJob.getSpec().getSchedule(), anyOf(is(cronStart), is(cronStop)));
            assertThat(cronJob.getMetadata().getName(), anyOf(is(startCronJobName), is(stopCronJobName)));
        });
    }
}
