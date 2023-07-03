package fr.axa.openpaas.dailyclean.util.wrapper;

import fr.axa.openpaas.dailyclean.model.Workload;
import io.fabric8.kubernetes.api.model.ObjectMeta;
import io.fabric8.kubernetes.api.model.PodTemplateSpec;
import io.fabric8.kubernetes.api.model.apps.StatefulSet;
import io.fabric8.kubernetes.api.model.apps.StatefulSetSpec;
import io.fabric8.kubernetes.api.model.apps.StatefulSetStatus;

public class StatefulSetWrapper implements IWorkloadWrapper<StatefulSetStatus, StatefulSetSpec> {

    private final StatefulSet workload;

    public StatefulSetWrapper(StatefulSet workload) {
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
        return Workload.TypeEnum.STATEFULSET;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public StatefulSetStatus getStatus() {
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
    public StatefulSetSpec getSpec() {
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
        return dailycleaned != null && dailycleaned;
    }
}
