package io.github.dutianze.yotsuba.tool.domain.policy;

import com.atilika.kuromoji.jumandic.Token;

import java.util.Map;

/**
 * @author dutianze
 * @date 2024/7/9
 */
public record PolicyContext(Token token, Map<String, String> englishContext) {
}
