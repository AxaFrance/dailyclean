package fr.axa.openpaas.dailyclean.resource;

import fr.axa.openpaas.dailyclean.model.TimeRange;
import fr.axa.openpaas.dailyclean.service.KubernetesService;
import io.quarkus.runtime.StartupEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.enterprise.event.Observes;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/timeranges")
public class TimeRangesResource {

    private static final Logger LOGGER = LoggerFactory.getLogger(TimeRangesResource.class);
    private final KubernetesService kubernetesService;

    public TimeRangesResource(KubernetesService kubernetesService) {
        this.kubernetesService = kubernetesService;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public TimeRange create(TimeRange timeRange) {
        if(timeRange == null) {
            throw new BadRequestException("The timerange is not properly set.");
        }

        kubernetesService.deleteCronJobs();

        kubernetesService.createStartCronJob(timeRange.getCronStart());
        kubernetesService.createStopCronJob(timeRange.getCronStop());

        return timeRange;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public TimeRange get() {
        String cronStart = kubernetesService.getCronStartAsString();
        String cronStop = kubernetesService.getCronStopAsString();

        return new TimeRange()
                .cronStart(cronStart)
                .cronStop(cronStop);
    }

    public void onStart(@Observes StartupEvent ev) {
        LOGGER.info("The application is starting, we have to update cronJobs...");
        kubernetesService.updatingCronJobIfNeeded();
    }
}
