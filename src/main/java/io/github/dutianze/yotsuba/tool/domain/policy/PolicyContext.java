package io.github.dutianze.yotsuba.tool.domain.policy;


import com.atilika.kuromoji.ipadic.neologd.Token;

import java.util.Map;

/**
 * @author dutianze
 * @date 2024/7/9
 */
public record PolicyContext(TokenRecord tokenRecord, Map<String, String> englishContext) {
    public Token token() {
        return tokenRecord.token();
    }
}
