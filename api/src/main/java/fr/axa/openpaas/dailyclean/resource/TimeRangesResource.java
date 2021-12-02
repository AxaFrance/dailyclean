package fr.axa.openpaas.dailyclean.resource;

import fr.axa.openpaas.dailyclean.model.TimeRange;
import fr.axa.openpaas.dailyclean.service.KubernetesService;
import org.apache.commons.lang3.StringUtils;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/timeranges")
public class TimeRangesResource {

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
}
