package io.github.dutianze.yotsuba.tool.domain.policy;

import io.github.dutianze.yotsuba.tool.domain.common.StringHelper;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class EnglishPolicy extends BasePolicy {

    @Override
    public int priority() {
        return 2;
    }

    @Override
    public boolean canApply(TokenRecord tokenRecord) {
        return StringHelper.containsKatakana(tokenRecord.surface());
    }

    @Override
    public String apply(PolicyContext policyContext) {
        Map<String, String> englishContext = policyContext.englishContext();
        if (englishContext == null || englishContext.isEmpty()) {
            return policyContext.surface();
        }
        String english = englishContext.get(policyContext.surface());
        if (english == null) {
            return policyContext.surface();
        }
        return applyRuby(policyContext.surface(), english);
    }
}