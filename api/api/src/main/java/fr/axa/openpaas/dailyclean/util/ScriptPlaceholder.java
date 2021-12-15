package fr.axa.openpaas.dailyclean.util;

public enum ScriptPlaceholder {

    NAME("{{name}}"),
    ARGUMENT("{{argument}}"),
    SCHEDULE("{{schedule}}"),
    IMG_NAME("{{imgName}}");

    private String placeholder;
    ScriptPlaceholder(String placeholder) {
        this.placeholder = placeholder;
    }

    public String getPlaceholder() {
        return placeholder;
    }
}
