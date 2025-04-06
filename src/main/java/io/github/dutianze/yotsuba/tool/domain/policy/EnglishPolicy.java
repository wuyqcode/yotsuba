package io.github.dutianze.yotsuba.tool.domain.policy;

import com.atilika.kuromoji.jumandic.Token;
import io.github.dutianze.yotsuba.tool.domain.share.StringHelper;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * @author dutianze
 * @date 2024/7/9
 */
@Service
public class EnglishPolicy extends BasePolicy {

    @Override
    public int priority() {
        return 2;
    }

    @Override
    public boolean canApply(Token token) {
        return StringHelper.containsKatakana(token.getSurface());
    }

    @Override
    public String apply(PolicyContext policyContext) {
        Token token = policyContext.token();
        Map<String, String> englishContext = policyContext.englishContext();
        if (englishContext == null || englishContext.isEmpty()) {
            return token.getSurface();
        }
        String english = englishContext.get(token.getSurface());
        if (english == null) {
            return token.getSurface();
        }
        return applyRuby(token.getSurface(), english);
    }
}