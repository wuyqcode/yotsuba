package io.github.dutianze.yotsuba.tool.domain.policy;

import com.atilika.kuromoji.jumandic.Token;
import io.github.dutianze.yotsuba.tool.domain.share.StringHelper;
import org.springframework.stereotype.Service;

/**
 * @author dutianze
 * @date 2024/7/9
 */
@Service
public class HiraganaPolicy extends BasePolicy {

    @Override
    public int priority() {
        return 1;
    }

    @Override
    public boolean canApply(Token token) {
        return StringHelper.containsKanji(token.getSurface());
    }

    @Override
    public String apply(PolicyContext policyContext) {
        Token token = policyContext.token();
        String reading = token.getReading();
        if (!StringHelper.containsHiragana(reading)) {
            return token.getSurface();
        }
        return applyRuby(token.getSurface(), reading);
    }
}
