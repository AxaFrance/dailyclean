package fr.axa.openpaas.dailyclean.util;

public enum ScriptPlaceholder {

    NAME("{{name}}"),
    ARGUMENT("{{argument}}"),
    SCHEDULE("{{schedule}}"),
    IMG_NAME("{{imgName}}"),
    SERVICE_ACCOUNT_NAME("{{serviceAccountName}}"),
    TIME_ZONE("{{timeZone}}"),
    SUSPEND("{{suspend}}");

    private String placeholder;
    ScriptPlaceholder(String placeholder) {
        this.placeholder = placeholder;
    }

    public String getPlaceholder() {
        return placeholder;
    }
}
