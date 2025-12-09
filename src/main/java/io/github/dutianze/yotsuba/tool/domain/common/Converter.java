package io.github.dutianze.yotsuba.tool.domain.common;

import java.util.HashMap;
import java.util.Map;


public class Converter {
    private static final String ALL_HIRA = "ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔゕゖ"
                                           + "ゝゞ";
    private static final String ALL_KATA = "ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ"
                                           + "ヽヾ";

    private static final Map<Character, Character> hiraToKata;
    private static final Map<Character, Character> kataToHira;

    static {
        hiraToKata = new HashMap<>();
        kataToHira = new HashMap<>();
        for (int i = 0; i < ALL_HIRA.length(); i++) {
            hiraToKata.put(ALL_HIRA.charAt(i), ALL_KATA.charAt(i));
            kataToHira.put(ALL_KATA.charAt(i), ALL_HIRA.charAt(i));
        }
    }

    public static String hira2kata(String text) {
        StringBuilder result = new StringBuilder();
        for (char ch : text.toCharArray()) {
            result.append(hiraToKata.getOrDefault(ch, ch));
        }
        return result.toString();
    }

    public static String kata2hira(String text) {
        StringBuilder result = new StringBuilder();
        for (char ch : text.toCharArray()) {
            result.append(kataToHira.getOrDefault(ch, ch));
        }
        return result.toString();
    }
}

