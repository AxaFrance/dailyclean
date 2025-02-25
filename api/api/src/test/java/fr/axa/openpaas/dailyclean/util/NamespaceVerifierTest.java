package fr.axa.openpaas.dailyclean.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

class NamespaceVerifierTest {

    public static final String GIVEN_REGEX = "-prod-fr";

    @Test
    void isNotAuthorize_ShouldReturnFalse_When_NamespaceNameDontMatchesWithGivenRegex() {
        assertThat(NamespaceVerifier.isNotAuthorize("prod", GIVEN_REGEX), is(false));
        assertThat(NamespaceVerifier.isNotAuthorize("", GIVEN_REGEX), is(false));
        assertThat(NamespaceVerifier.isNotAuthorize("daily-recette-fr", GIVEN_REGEX), is(false));
        assertThat(NamespaceVerifier.isNotAuthorize("daily-prod-en", GIVEN_REGEX), is(false));
    }

    @ParameterizedTest
    @NullAndEmptySource
    void isNotAuthorize_ShouldReturnFalse_When_NamespaceNameDontMatchesWithNullOrEmptyRegex(String givenRegex) {
        assertThat(NamespaceVerifier.isNotAuthorize("prod", givenRegex), is(false));
        assertThat(NamespaceVerifier.isNotAuthorize("prod", givenRegex), is(false));
    }

    @Test
    void isNotAuthorize_ShouldReturnTrue_When_NamespaceNameMatchesWithGivenRegex() {
        assertThat(NamespaceVerifier.isNotAuthorize("daily-prod-fr", GIVEN_REGEX), is(true));
        assertThat(NamespaceVerifier.isNotAuthorize("daily-prod-fr-daily", GIVEN_REGEX), is(true));
    }
}