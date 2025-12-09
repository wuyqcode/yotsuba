package io.github.dutianze.yotsuba.tool.domain.policy;

import com.atilika.kuromoji.ipadic.neologd.Token;

/**
 * @author dutianze
 * @date 2025/5/29
 */
public record TokenRecord(Token token) {
    public String getSurface() {
        return token.getSurface();
    }
}
