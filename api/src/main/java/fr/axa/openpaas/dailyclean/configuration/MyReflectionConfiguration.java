package fr.axa.openpaas.dailyclean.configuration;

import fr.axa.openpaas.dailyclean.model.Error;
import fr.axa.openpaas.dailyclean.model.StartStopResponse;
import fr.axa.openpaas.dailyclean.model.Status;
import fr.axa.openpaas.dailyclean.model.TimeRange;
import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection(targets={
        Error.class,
        StartStopResponse.class,
        Status.class,
        TimeRange.class})
public class MyReflectionConfiguration {
}
