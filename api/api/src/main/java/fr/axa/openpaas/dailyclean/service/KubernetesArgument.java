package fr.axa.openpaas.dailyclean.service;

public enum KubernetesArgument {

    STOP("stop"),
    START("start");

    private String value;
    KubernetesArgument(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
