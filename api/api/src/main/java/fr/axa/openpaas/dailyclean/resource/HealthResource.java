package fr.axa.openpaas.dailyclean.resource;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/health")
public class HealthResource {

    public static final String GREETINGS = "Hello ! Service %s version %s is up!";

    @ConfigProperty(name = "service.name")
    String serviceName;

    @ConfigProperty(name = "service.version")
    String serviceVersion;

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String hello() {
        return String.format(GREETINGS, serviceName, serviceVersion);
    }
}