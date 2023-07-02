package fr.axa.openpaas.dailyclean.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.kubernetes.client.WithKubernetesTestServer;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@WithKubernetesTestServer
@QuarkusTest
public class HealthResourceTest {

    private static final String SERVICE_NAME = "Dailyclean";
    private static final String SERVICE_VERSION = "1.0.0";


    @Test
    public void testHelloEndpoint() {
        given()
          .when().get("/health")
          .then()
             .statusCode(HttpStatus.SC_OK)
             .body(is(String.format(HealthResource.GREETINGS, SERVICE_NAME, SERVICE_VERSION)));
    }

}