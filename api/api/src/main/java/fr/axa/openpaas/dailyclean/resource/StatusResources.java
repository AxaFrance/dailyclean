package fr.axa.openpaas.dailyclean.resource;

import fr.axa.openpaas.dailyclean.model.Status;
import fr.axa.openpaas.dailyclean.service.KubernetesService;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/status")
public class StatusResources {

    private final KubernetesService kubernetesService;

    public StatusResources(final KubernetesService kubernetesService) {
        this.kubernetesService = kubernetesService;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Status getStatus() {
        Status status = new Status();
        status.setNamespace(kubernetesService.getNamespace());
        status.setWorkloads(kubernetesService.getWorkloads());

        var workloads = status.getWorkloads();
        long started = workloads.stream()
                .filter(deployment -> deployment.getIsDailycleaned() && deployment.getCurrent().intValue() >= 1)
                .count();
        long stopped = workloads.stream()
                .filter(deployment -> deployment.getIsDailycleaned() && deployment.getCurrent().intValue() == 0)
                .count();

        Status.StateEnum state;
        if(started == 0) {
            state = Status.StateEnum.STOPPED;
        } else if(stopped == 0) {
            state = Status.StateEnum.STARTED;
        } else {
            state = Status.StateEnum.IN_PROGRESS;
        }
        status.setState(state);

        return status;
    }


}
