package fr.axa.openpaas.dailyclean.util;

import org.apache.commons.lang3.StringUtils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class NamespaceVerifier {

    public static boolean isNotAuthorize(final String namespace, final String regex) {
        if(StringUtils.isBlank(regex)){
            return false;
        }

        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(namespace);

        return matcher.find();
    }
}