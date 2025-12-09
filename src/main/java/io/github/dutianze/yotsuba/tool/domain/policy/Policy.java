package io.github.dutianze.yotsuba.tool.domain.policy;


/**
 * @author dutianze
 * @date 2024/7/9
 */
public interface Policy {

    int priority();

    boolean canApply(TokenRecord tokenRecord);

    String apply(PolicyContext policyContext);
}
