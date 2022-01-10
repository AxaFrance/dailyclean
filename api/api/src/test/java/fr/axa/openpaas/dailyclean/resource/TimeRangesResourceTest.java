package fr.axa.openpaas.dailyclean.resource;

import fr.axa.openpaas.dailyclean.model.TimeRange;
import fr.axa.openpaas.dailyclean.util.KubernetesUtils;
import io.fabric8.kubernetes.api.model.Container;
import io.fabric8.kubernetes.api.model.batch.CronJob;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.server.mock.KubernetesServer;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.kubernetes.client.KubernetesTestServer;
import io.quarkus.test.kubernetes.client.WithKubernetesTestServer;
import org.apache.http.HttpStatus;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.inject.Inject;
import javax.ws.rs.core.MediaType;
import java.io.InputStream;
import java.util.List;

import static fr.axa.openpaas.dailyclean.service.KubernetesArgument.START;
import static fr.axa.openpaas.dailyclean.service.KubernetesArgument.STOP;
import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.anyOf;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.nullValue;
import static org.hamcrest.MatcherAssert.assertThat;

@WithKubernetesTestServer
@QuarkusTest
public class TimeRangesResourceTest {

    private static final String OLD_IMAGE_NAME = "imagename:1.0.0";

    @KubernetesTestServer
    KubernetesServer mockServer;

    @Inject
    TimeRangesResource resource;

    @ConfigProperty(name = "service.job.imageName")
    String imgName;

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

        InputStream cronJobStart = KubernetesUtils.createCronJobAsInputStream(START, cronStart, "imgName", "default");

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

    @Test
    public void shouldUpdateTheImageVersionOnStartup() {
        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();

        // Create cron jobs with old versions
        InputStream cronJobStart =
                KubernetesUtils.createCronJobAsInputStream(START, "0 10 * * *", OLD_IMAGE_NAME, "default");
        InputStream cronJobStop =
                KubernetesUtils.createCronJobAsInputStream(STOP, "0 10 * * *", OLD_IMAGE_NAME, "default");

        client.load(cronJobStart).inNamespace(namespace).createOrReplace();
        client.load(cronJobStop).inNamespace(namespace).createOrReplace();

        resource.onStart(null);

        List<CronJob> cronJobs = client.batch().cronjobs().inNamespace(namespace).list().getItems();
        assertThat(cronJobs.size(), is(2));

        cronJobs.forEach(cronJob -> {
            Container container = cronJob.getSpec()
                    .getJobTemplate()
                    .getSpec()
                    .getTemplate()
                    .getSpec()
                    .getContainers()
                    .stream().findFirst().orElseThrow();

            assertThat(container.getImage(), is(imgName));
        });
    }

    @Test
    public void shouldUpdateTheImageVersionOnStartupOnlyIfStartExisted() {
        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();

        String startCronJobName = KubernetesUtils.getCronName(START);
        String cronStart = "0 10 * * *";


        // Create cron jobs with old versions
        InputStream cronJobStart =
                KubernetesUtils.createCronJobAsInputStream(START, cronStart, OLD_IMAGE_NAME, "default");

        client.load(cronJobStart).inNamespace(namespace).createOrReplace();

        resource.onStart(null);

        List<CronJob> cronJobs = client.batch().cronjobs().inNamespace(namespace).list().getItems();
        assertThat(cronJobs.size(), is(1));

        cronJobs.forEach(cronJob -> {
            Container container = cronJob.getSpec()
                    .getJobTemplate()
                    .getSpec()
                    .getTemplate()
                    .getSpec()
                    .getContainers()
                    .stream().findFirst().orElseThrow();

            assertThat(container.getImage(), is(imgName));
            assertThat(cronJob.getSpec().getSchedule(), is(cronStart));
            assertThat(cronJob.getMetadata().getName(), is(startCronJobName));
        });
    }

    @Test
    public void shouldUpdateTheImageVersionOnStartupOnlyIfStopExisted() {
        KubernetesClient client = mockServer.getClient();
        final String namespace = client.getNamespace();

        String stopCronJobName = KubernetesUtils.getCronName(STOP);
        String cronStop = "0 10 * * *";


        // Create cron jobs with old versions
        InputStream cronJobStop =
                KubernetesUtils.createCronJobAsInputStream(STOP, cronStop, OLD_IMAGE_NAME, "default");

        client.load(cronJobStop).inNamespace(namespace).createOrReplace();

        resource.onStart(null);

        List<CronJob> cronJobs = client.batch().cronjobs().inNamespace(namespace).list().getItems();
        assertThat(cronJobs.size(), is(1));

        cronJobs.forEach(cronJob -> {
            Container container = cronJob.getSpec()
                    .getJobTemplate()
                    .getSpec()
                    .getTemplate()
                    .getSpec()
                    .getContainers()
                    .stream().findFirst().orElseThrow();

            assertThat(container.getImage(), is(imgName));
            assertThat(cronJob.getSpec().getSchedule(), is(cronStop));
            assertThat(cronJob.getMetadata().getName(), is(stopCronJobName));
        });
    }

    private void initializeExistingCronJobs(String cronStart, String cronStop) {
        InputStream cronJobStart = KubernetesUtils.createCronJobAsInputStream(START, cronStart, "imgName", "default");
        InputStream cronJobStop = KubernetesUtils.createCronJobAsInputStream(STOP, cronStop, "imgName", "default");

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
