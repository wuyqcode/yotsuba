package io.github.dutianze.yotsuba.tool.domain.policy;

import java.util.Map;

public record PolicyContext(TokenRecord tokenRecord, Map<String, String> englishContext) {

    public String surface() {
        return tokenRecord.surface();
    }

    public String reading() {
        return tokenRecord.reading();
    }
}