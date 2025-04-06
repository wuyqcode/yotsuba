package io.github.dutianze.yotsuba.tool.domain.share;

/**
 * @author dutianze
 * @date 2024/7/9
 */
public interface StringHelper {

    static boolean containsKatakana(String input) {
        for (char c : input.toCharArray()) {
            if (Character.UnicodeScript.of(c) == Character.UnicodeScript.KATAKANA) {
                return true;
            }
        }
        return false;
    }

    static boolean containsKanji(String input) {
        for (char c : input.toCharArray()) {
            if (Character.UnicodeScript.of(c) == Character.UnicodeScript.HAN) {
                return true;
            }
        }
        return false;
    }

    static boolean containsHiragana(String input) {
        for (char c : input.toCharArray()) {
            if (Character.UnicodeScript.of(c) == Character.UnicodeScript.HIRAGANA) {
                return true;
            }
        }
        return false;
    }
}
