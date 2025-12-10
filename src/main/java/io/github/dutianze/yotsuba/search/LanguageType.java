package io.github.dutianze.yotsuba.search;

import io.github.dutianze.yotsuba.tool.domain.common.StringHelper;
import lombok.Getter;
import org.apache.commons.lang3.CharUtils;

@Getter
public enum LanguageType {
    EN("title.content_en", "content.content_en"),
    CN("title.content_en", "content.content_cn"),
    JA("title.content_en", "content.content_ja");

    private final String titleField;
    private final String contentField;

    public String[] getFields() {
        return new String[]{titleField, contentField};
    }

    LanguageType(String titleField, String contentField) {
        this.titleField = titleField;
        this.contentField = contentField;
    }

    public static LanguageType detectLanguage(String input) {
        if (input == null || input.isBlank()) {
            return EN;
        }

        // 全ascii → 英语
        if (input.codePoints().allMatch(c -> CharUtils.isAscii((char) c))) {
            return EN;
        }
        // 去掉ascii后再判断
        String cleaned = input.replaceAll("[\\x00-\\x7F]", "").trim();
        // 清理后为空 → 本质上是“ascii”
        if (cleaned.isEmpty()) {
            return EN;
        }

        // 含假名 → 日语
        if (StringHelper.containsHiragana(cleaned) || StringHelper.containsKatakana(cleaned)) {
            return JA;
        }
/*
        TODO
        List<Token> tokenize = Constant.tokenizer.tokenize(cleaned);
        boolean allKnown = tokenize.stream().allMatch(Token::isKnown);
        if (allKnown) {
            return JA;
        }
*/

        return CN;
    }

    public String extractHighlight(NoteSingleHighlightProjection p) {
        return switch (this) {
            case EN -> p.enHighlight();
            case CN -> p.cnHighlight();
            case JA -> p.jaHighlight();
        };
    }
}
