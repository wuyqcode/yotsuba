package io.github.dutianze.tool.domain.policy;

import com.atilika.kuromoji.jumandic.Token;

/**
 * @author dutianze
 * @date 2024/7/9
 */
public interface Policy {

    int priority();

    boolean canApply(Token token);

    String apply(PolicyContext policyContext);
}
