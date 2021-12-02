package fr.axa.openpaas.dailyclean.service;

import com.cronutils.builder.CronBuilder;
import com.cronutils.model.Cron;
import com.cronutils.model.CronType;
import com.cronutils.model.definition.CronDefinition;
import com.cronutils.model.definition.CronDefinitionBuilder;
import com.cronutils.model.field.CronFieldName;
import com.cronutils.model.field.expression.FieldExpression;
import com.cronutils.model.time.ExecutionTime;
import com.cronutils.parser.CronParser;
import fr.axa.openpaas.dailyclean.util.DateUtils;
import io.quarkus.scheduler.Scheduled;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.enterprise.context.ApplicationScoped;
import javax.ws.rs.InternalServerErrorException;
import java.time.ZonedDateTime;

import static com.cronutils.model.field.expression.FieldExpressionFactory.on;

@ApplicationScoped
public class ScheduledTimeSwitchOverService {

    private static final Logger logger = LoggerFactory.getLogger(ScheduledTimeSwitchOverService.class);
    private static final CronDefinition cronDefinition = CronDefinitionBuilder.instanceDefinitionFor(CronType.UNIX);
    private static final IHourTransformation SUMMER_TIME_TRANSFORMATION = hour -> hour == 23 ? 0 : ++hour;
    private static final IHourTransformation WINTER_TIME_TRANSFORMATION = hour -> hour == 0 ? 23 : --hour;

    private final KubernetesService kubernetesService;
    private final DateUtils dateUtils;

    public ScheduledTimeSwitchOverService(final KubernetesService kubernetesService,
                                          final DateUtils dateUtils) {
        this.kubernetesService = kubernetesService;
        this.dateUtils = dateUtils;
    }

    /**
     * Scheduled task launched when we switch to summer time. Update all the existed CronJobs.
     */
    @Scheduled(cron="0 3 * 3 0")
    void switchToSummerTime() {
        logger.info("Sunday of march. Is it Summer Time?");
        if(dateUtils.isLastSundayOfMonth()) {
            logger.info("Summer Time");

            String cronStart = kubernetesService.getCronStartAsString();
            String cronStop = kubernetesService.getCronStopAsString();

            String newCronStart = getCronWithSummerTimeAsString(cronStart);
            String newCronStop = getCronWithSummerTimeAsString(cronStop);

            kubernetesService.deleteCronJobs();

            kubernetesService.createStartCronJob(newCronStart);
            kubernetesService.createStopCronJob(newCronStop);
        }
    }

    /**
     * Scheduled task launched when we switch to winter time. Update all the existed CronJobs.
     */
    @Scheduled(cron="0 3 * 10 0")
    void switchToWinterTime() {
        logger.info("Sunday of October. Is it Winter Time?");
        if(dateUtils.isLastSundayOfMonth()) {
            logger.info("Winter Time");

            String cronStart = kubernetesService.getCronStartAsString();
            String cronStop = kubernetesService.getCronStopAsString();

            String newCronStart = getCronWithWinterTimeAsString(cronStart);
            String newCronStop = getCronWithWinterTimeAsString(cronStop);

            kubernetesService.deleteCronJobs();

            kubernetesService.createStartCronJob(newCronStart);
            kubernetesService.createStopCronJob(newCronStop);
        }
    }

    private String getCronWithSummerTimeAsString(String cronAsString) {
        if(cronAsString == null) {
            return null;
        }
        return getTransformedCronAsString(cronAsString, SUMMER_TIME_TRANSFORMATION);
    }

    private String getCronWithWinterTimeAsString(String cronAsString) {
        if(cronAsString == null) {
            return null;
        }
        return getTransformedCronAsString(cronAsString, WINTER_TIME_TRANSFORMATION);
    }

    private String getTransformedCronAsString(String cronAsString, IHourTransformation transformation) {
        CronParser parser = new CronParser(cronDefinition);
        Cron cron = parser.parse(cronAsString);
        ExecutionTime executionTime = ExecutionTime.forCron(cron);

        FieldExpression domExpression = cron.retrieve(CronFieldName.DAY_OF_MONTH).getExpression();
        FieldExpression monthExpression = cron.retrieve(CronFieldName.MONTH).getExpression();
        FieldExpression dowExpression = cron.retrieve(CronFieldName.DAY_OF_WEEK).getExpression();

        ZonedDateTime dateTime = executionTime.nextExecution(ZonedDateTime.now())
                .orElseThrow(() -> new InternalServerErrorException("Cannot retrieve next execution time"));
        int hour = dateTime.getHour();

        Cron newCron = CronBuilder.cron(cronDefinition)
                .withHour(on(transformation.transformHour(hour)))
                .withMinute(on(dateTime.getMinute()))
                .withDoM(domExpression)
                .withMonth(monthExpression)
                .withDoW(dowExpression)
                .instance();

        return newCron.asString();
    }

    private interface IHourTransformation {
        int transformHour(int hour);
    }
}
