package io.github.dutianze.yotsuba.tool.domain.policy;

import com.atilika.kuromoji.jumandic.Token;
import io.github.dutianze.yotsuba.tool.domain.share.Constant;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

/**
 * @author dutianze
 * @date 2024/7/9
 */
@Service
public class PolicyManager {

    private final List<Policy> policies;

    public PolicyManager(List<Policy> policies) {
        this.policies = policies;
    }

    public String convert(String text, Map<String, String> englishContext) {
        List<Token> tokenize = Constant.tokenizer.tokenize(text);
        if (tokenize.isEmpty()) {
            return text;
        }
        StringBuilder result = new StringBuilder();
        for (Token token : tokenize) {
            String convertedText = policies.stream()
                                           .sorted(Comparator.comparing(Policy::priority))
                                           .filter(policy -> policy.canApply(token))
                                           .findFirst()
                                           .map(policy -> policy.apply(new PolicyContext(token, englishContext)))
                                           .orElseGet(token::getSurface);
            result.append(convertedText);
        }
        return result.toString();
    }
}