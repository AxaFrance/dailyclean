package fr.axa.openpaas.dailyclean.util;

import jakarta.enterprise.context.ApplicationScoped;
import java.time.DayOfWeek;
import java.time.LocalDate;

@ApplicationScoped
public class DateUtils {

    public boolean isLastSundayOfMonth() {
        LocalDate now = getNow();
        return now.getDayOfWeek() == DayOfWeek.SUNDAY && now.getDayOfMonth() > 24;
    }

    protected LocalDate getNow() {
        return LocalDate.now();
    }

}
