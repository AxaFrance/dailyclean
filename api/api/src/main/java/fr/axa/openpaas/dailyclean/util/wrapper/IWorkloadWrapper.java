package fr.axa.openpaas.dailyclean.util.wrapper;

import fr.axa.openpaas.dailyclean.model.Workload;
import io.fabric8.kubernetes.api.model.ObjectMeta;
import io.fabric8.kubernetes.api.model.PodTemplateSpec;

public interface IWorkloadWrapper <S, P> {

    /**
     * Get the metadata of this workload
     * @return an ObjectMeta
     */
    ObjectMeta getMetadata();

    /**
     * Get the type of the workload
     * @return an element of the enum type
     */
    Workload.TypeEnum getType();

    /**
     * The representation of the status of this workload
     * @return an object which is the representation of the status, the type is S
     */
    S getStatus();

    /**
     * The number of replicas requested in the status of this workload
     * @return an integer, 0 if the number in the status is null
     */
    int getReplicas();

    /**
     * The number of replicas which are ready in the status of this workload
     * @return an integer, 0 if the number in the status is null
     */
    int getReadyReplicas();

    /**
     * Get the spec representation for this workload
     * @return an object which is the representation of the spec of this workload, type is P
     */
    P getSpec();

    /**
     * A PodTemplateSpec from the spec representation of this workload
     * @return a PodTemplateSpec
     */
    PodTemplateSpec getPodTemplateSpec();

    /**
     * Get if this workload is dailycleaned or not
     * @param dailycleaned The value of the label axa.com/dailyclean from the labels of the workload
     * @return true if dailyclean is needed, false otherwise
     */
    boolean isDailycleaned(Boolean dailycleaned);

}
