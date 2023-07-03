package fr.axa.openpaas.dailyclean.util.wrapper;

import fr.axa.openpaas.dailyclean.model.Workload;
import io.fabric8.kubernetes.api.model.ObjectMeta;
import io.fabric8.kubernetes.api.model.PodTemplateSpec;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.api.model.apps.DeploymentSpec;
import io.fabric8.kubernetes.api.model.apps.DeploymentStatus;

public class DeploymentWrapper implements IWorkloadWrapper<DeploymentStatus, DeploymentSpec> {

    private final Deployment workload;

    public DeploymentWrapper(Deployment workload) {
        this.workload = workload;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ObjectMeta getMetadata() {
        return workload.getMetadata();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Workload.TypeEnum getType() {
        return Workload.TypeEnum.DEPLOYMENT;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public DeploymentStatus getStatus() {
        return workload.getStatus();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public int getReplicas() {
        Integer replicas = getStatus().getReplicas();
        return replicas != null ? replicas : 0;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public int getReadyReplicas() {
        Integer replicas = getStatus().getReadyReplicas();
        return replicas != null ? replicas : 0;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public DeploymentSpec getSpec() {
        return workload.getSpec();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public PodTemplateSpec getPodTemplateSpec() {
        return getSpec().getTemplate();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public boolean isDailycleaned(Boolean dailycleaned) {
        return dailycleaned == null || dailycleaned;
    }
}
