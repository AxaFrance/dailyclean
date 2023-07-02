package fr.axa.openpaas.dailyclean.util;

import io.quarkus.test.Mock;

import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDate;

@Mock
@ApplicationScoped
public class MockedDateUtils extends DateUtils {

    private LocalDate currentNow;

    @Override
    protected LocalDate getNow() {
        return currentNow;
    }

    public void setCurrentNow(LocalDate localDate) {
        this.currentNow = localDate;
    }
}
