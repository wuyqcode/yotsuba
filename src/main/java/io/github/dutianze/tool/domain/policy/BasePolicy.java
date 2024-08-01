package io.github.dutianze.tool.domain.policy;

/**
 * @author dutianze
 * @date 2024/7/9
 */
public abstract class BasePolicy implements Policy {


    protected String applyRuby(String kanji, String kana) {
        String commonPrefix = findCommonPrefix(kanji, kana);
        String commonSuffix = findCommonSuffix(kanji, kana);
        int prefixLength = commonPrefix.length();
        int suffixLength = commonSuffix.length();

        if (kanji.length() - suffixLength == 0) {
            return kanji;
        }

        String kanjiMiddle = kanji.substring(prefixLength, kanji.length() - suffixLength);
        String kanaMiddle = kana.substring(prefixLength, kana.length() - suffixLength);

        return commonPrefix + "<ruby>" + kanjiMiddle + "<rt>" + kanaMiddle + "</rt></ruby>" + commonSuffix;
    }

    private String findCommonPrefix(String a, String b) {
        int minLength = Math.min(a.length(), b.length());
        StringBuilder commonPrefix = new StringBuilder();
        for (int i = 0; i < minLength; i++) {
            if (a.charAt(i) == b.charAt(i)) {
                commonPrefix.append(a.charAt(i));
            } else {
                break;
            }
        }
        return commonPrefix.toString();
    }

    private String findCommonSuffix(String a, String b) {
        int minLength = Math.min(a.length(), b.length());
        StringBuilder commonSuffix = new StringBuilder();
        for (int i = 0; i < minLength; i++) {
            char c = a.charAt(a.length() - 1 - i);
            if (c == b.charAt(b.length() - 1 - i)) {
                commonSuffix.insert(0, c);
            } else {
                break;
            }
        }
        return commonSuffix.toString();
    }

}
