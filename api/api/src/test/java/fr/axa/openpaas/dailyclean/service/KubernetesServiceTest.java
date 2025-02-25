package fr.axa.openpaas.dailyclean.service;

import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.server.mock.EnableKubernetesMockClient;
import jakarta.ws.rs.InternalServerErrorException;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertThrows;

@EnableKubernetesMockClient(crud = true)
class KubernetesServiceTest {

    static KubernetesClient kubernetesClient;

    @Test
    void createDefaultStopCronJobIfNotExist_ShouldThrowInternalServerErrorException_WhenUnauthorizedNamespaceRegexIsGiven() {
        KubernetesService kubernetesService = new KubernetesService(kubernetesClient);
        kubernetesService.imgName = "1.0.0";
        //Default namespace name with on kubernetes test cluster
        kubernetesService.unauthorizedNamespaceRegex = Optional.of("test");

        InternalServerErrorException internalServerErrorException = assertThrows(InternalServerErrorException.class, kubernetesService::createDefaultStopCronJobIfNotExist);

        assertThat(internalServerErrorException.getMessage(),
                is("Create CronJob action is not authorized for this namespace. Actual regex for unauthorized namespace : test"));
    }
}