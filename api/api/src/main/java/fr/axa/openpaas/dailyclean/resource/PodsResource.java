package fr.axa.openpaas.dailyclean.resource;


import fr.axa.openpaas.dailyclean.model.StartStopResponse;
import fr.axa.openpaas.dailyclean.service.KubernetesService;

import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;

@Path("pods")
public class PodsResource {

    public final static String STOP_MESSAGE = "Service is stoping ...";
    public final static String START_MESSAGE = "Service is starting ...";

    private final KubernetesService kubernetesService;

    public PodsResource(KubernetesService kubernetesService) {
        this.kubernetesService = kubernetesService;
    }

    @Path("/stop")
    @POST
    public StartStopResponse stop() {
        kubernetesService.createStopJob();
        StartStopResponse response = new StartStopResponse();
        response.setMessage(STOP_MESSAGE);
        return response;
    }

    @Path("/start")
    @POST
    public StartStopResponse start() {
        kubernetesService.createStartJob();
        StartStopResponse response = new StartStopResponse();
        response.setMessage(START_MESSAGE);
        return response;
    }
}
