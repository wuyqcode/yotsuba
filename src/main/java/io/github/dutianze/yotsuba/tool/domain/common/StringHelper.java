package io.github.dutianze.yotsuba.tool.domain.common;

/**
 * @author dutianze
 * @date 2024/7/9
 */
public interface StringHelper {

    static boolean containsKatakana(String input) {
        return input.codePoints().anyMatch(StringHelper::isKatakana);
    }

    static boolean containsKanji(String input) {
        return input.codePoints().anyMatch(StringHelper::isKanji);
    }

    static boolean containsHiragana(String input) {
        return input.codePoints().anyMatch(StringHelper::isHira);
    }

    static boolean isKanjiOnly(String text) {
        return text.codePoints().allMatch(StringHelper::isKanji);
    }

    static boolean isHira(int codePoint) {
        return Character.UnicodeBlock.of(codePoint) == Character.UnicodeBlock.HIRAGANA;
    }

    static boolean isKatakana(int codePoint) {
        return Character.UnicodeBlock.of(codePoint) == Character.UnicodeBlock.KATAKANA;
    }

    static boolean isKanji(int codePoint) {
        Character.UnicodeBlock block = Character.UnicodeBlock.of(codePoint);
        return block == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS ||
               block == Character.UnicodeBlock.CJK_COMPATIBILITY_IDEOGRAPHS ||
               block == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_A ||
               block == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_B ||
               block == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_C ||
               block == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_D;
    }
}
