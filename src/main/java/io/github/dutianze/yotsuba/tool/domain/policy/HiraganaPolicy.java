package io.github.dutianze.yotsuba.tool.domain.policy;

import io.github.dutianze.yotsuba.tool.domain.common.Converter;
import io.github.dutianze.yotsuba.tool.domain.common.StringHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * @author dutianze
 * @date 2024/7/9
 */
@Slf4j
@Service
public class HiraganaPolicy extends BasePolicy {

    @Override
    public int priority() {
        return 1;
    }

    @Override
    public boolean canApply(TokenRecord tokenRecord) {
        return StringHelper.containsKanji(tokenRecord.getSurface());
    }

    @Override
    public String apply(PolicyContext policyContext) {
        String surface = policyContext.token().getSurface();
        String reading = Converter.kata2hira(policyContext.token().getReading());
        if (!StringHelper.containsHiragana(reading)) {
            return surface;
        }

        // kanji: 沢山
        if (StringHelper.isKanjiOnly(surface)) {
            return this.rubyWrap(surface, reading);
        }

        //   hira + kanji: うれし涙
        //   kanji + hira: 見上げて
        CutResult cut = cutByHira(surface, reading);
        String prefix = cut.prefix();
        String suffix = cut.suffix();
        String midText = cut.middle().surface();
        String midHira = cut.middle().hira();
        if (StringHelper.isKanjiOnly(midText)) {
            return prefix + rubyWrap(midText, midHira) + suffix;
        }

        //  kanji + hira + kanji + hira: 思い出した
        //  kanji + hira + kanji + hira + kanji + hira: 引っ繰り返って
        return prefix + annotateCompoundWithRuby(midText, midHira) + suffix;
    }

    public String annotateCompoundWithRuby(String surface, String hira) {
        int[] codePoints = surface.codePoints().toArray();
        StringBuilder hiraInSurfaceReversed = new StringBuilder();
        for (int i = codePoints.length - 1; i >= 0; i--) {
            int codePoint = codePoints[i];
            if (StringHelper.isHira(codePoint)) {
                hiraInSurfaceReversed.appendCodePoint(codePoint);
            }
            if (StringHelper.isKanji(codePoint) && !hiraInSurfaceReversed.isEmpty()) {
                break;
            }
        }

        if (hiraInSurfaceReversed.isEmpty()) {
            return rubyWrap(surface, hira);
        }

        String hiraInSurface = hiraInSurfaceReversed.reverse().toString();
        int hiraIndexInSurface = surface.lastIndexOf(hiraInSurface);
        int hiraIndexInHira = hira.lastIndexOf(hiraInSurface);

        String leftSurface = surface.substring(0, hiraIndexInSurface);
        String leftHira = hira.substring(0, hiraIndexInHira);
        String rightSurface = surface.substring(hiraIndexInSurface + hiraInSurface.length());
        String rightHira = hira.substring(hiraIndexInHira + hiraInSurface.length());

        return annotateCompoundWithRuby(leftSurface, leftHira) + hiraInSurface + rubyWrap(rightSurface,
                                                                                          rightHira);
    }

    public CutResult cutByHira(String surface, String hira) {
        String prefix = findCommonPrefix(surface, hira);
        String suffix = findCommonSuffix(surface, hira);
        String midSurface = surface.substring(prefix.length(), surface.length() - suffix.length());
        String midHira = hira.substring(prefix.length(), hira.length() - suffix.length());
        return new CutResult(prefix, new MidPart(midSurface, midHira), suffix);
    }


    public record MidPart(String surface, String hira) {

    }

    public record CutResult(String prefix, MidPart middle, String suffix) {

    }
}
