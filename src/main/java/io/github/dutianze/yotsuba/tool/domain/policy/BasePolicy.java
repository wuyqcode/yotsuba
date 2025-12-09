package io.github.dutianze.yotsuba.tool.domain.policy;

/**
 * @author dutianze
 * @date 2024/7/9
 */
public abstract class BasePolicy implements Policy {


    protected String rubyWrap(String kanji, String hira) {
        return "<ruby>" + kanji + "<rt>" + hira + "</rt></ruby>";
    }

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

        return commonPrefix + rubyWrap(kanjiMiddle, kanaMiddle) + commonSuffix;
    }

    public String findCommonPrefix(String str1, String str2) {
        int len = Math.min(str1.length(), str2.length());
        int i = 0;
        while (i < len && str1.charAt(i) == str2.charAt(i)) {
            i++;
        }
        return str1.substring(0, i);
    }

    public String findCommonSuffix(String str1, String str2) {
        int len1 = str1.length(), len2 = str2.length();
        int i = 0;
        while (i < len1 && i < len2 && str1.charAt(len1 - 1 - i) == str2.charAt(len2 - 1 - i)) {
            i++;
        }
        return str1.substring(len1 - i);
    }

}
