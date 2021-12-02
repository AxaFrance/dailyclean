package fr.axa.openpaas.dailyclean.exception;

public enum ErrorCode {

    DEFAULT("-1");

    private String code;
    private ErrorCode(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

}
