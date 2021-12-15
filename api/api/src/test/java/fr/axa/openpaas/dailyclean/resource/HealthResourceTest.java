package fr.axa.openpaas.dailyclean.resource;

import io.quarkus.test.junit.QuarkusTest;
import org.apache.http.HttpStatus;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
public class HealthResourceTest {

    @ConfigProperty(name = "service.name", defaultValue = "TO DEFINE !!!")
    String serviceName;

    @ConfigProperty(name = "service.version", defaultValue = "TO DEFINE !!!")
    String serviceVersion;

    @Test
    public void testHelloEndpoint() {
        given()
          .when().get("/health")
          .then()
             .statusCode(HttpStatus.SC_OK)
             .body(is(String.format(HealthResource.GREETINGS, serviceName, serviceVersion)));
    }

}