package io.github.dutianze.api.rest;

import com.atilika.kuromoji.jumandic.Token;
import com.atilika.kuromoji.jumandic.Tokenizer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import nl.siegmann.epublib.domain.Book;
import nl.siegmann.epublib.domain.Resource;
import nl.siegmann.epublib.domain.SpineReference;
import nl.siegmann.epublib.epub.EpubReader;
import nl.siegmann.epublib.epub.EpubWriter;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * @author dutianze
 * @date 2024/7/2
 */
@RestController
@RequestMapping("/api")
public class EpubController {

    public static final Tokenizer TOKENIZER = new Tokenizer();
    private static final ConcurrentHashMap<String, String> cache = new ConcurrentHashMap<>();

    @PostMapping(value = "/uploadEpub", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = "application/json")
    public ResponseEntity<ByteArrayResource> uploadEpub(@RequestParam("file") MultipartFile file) throws IOException {
        // read epub
        EpubReader epubReader = new EpubReader();
        Book book = epubReader.readEpub(file.getInputStream());
        // add furigana
        List<SpineReference> spineReferences = book.getSpine().getSpineReferences();
        for (SpineReference spineReference : spineReferences) {
            Resource resource = spineReference.getResource();
            Document doc = Jsoup.parse(new String(resource.getData(), resource.getInputEncoding()));
            Elements paragraphs = doc.select("p");
            for (Element paragraph : paragraphs) {
                String content = paragraph.text();
                paragraph.empty();
                List<Token> tokenize = TOKENIZER.tokenize(content);
                if (tokenize.isEmpty()) {
                    paragraph.append(content);
                    continue;
                }
                for (Token token : tokenize) {
                    if (containsKanji(token.getSurface())) {
                        String ruby = convertToRuby(token.getSurface(), token.getReading());
                        paragraph.append(ruby);
                        continue;
                    }
//                    if (isKatakana(token.getSurface())) {
//                        Optional<String> english = translateKatakanaToEnglish(token.getSurface());
//                        if (english.isEmpty()) {
//                            paragraph.append(token.getSurface());
//                            continue;
//                        }
//                        String ruby = convertToRuby(token.getSurface(), english.get());
//                        paragraph.append(ruby);
//                        continue;
//                    }
                    paragraph.append(token.getSurface());
                }
            }
            resource.setData(doc.html().getBytes(StandardCharsets.UTF_8));
        }
        // write to file
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        EpubWriter epubWriter = new EpubWriter();
        epubWriter.write(book, outputStream);
        // output
        ByteArrayResource byteArrayResource = new ByteArrayResource(outputStream.toByteArray());
        HttpHeaders headers = new HttpHeaders();
        String fileName = URLEncoder.encode(Objects.requireNonNull(file.getOriginalFilename()), StandardCharsets.UTF_8);
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName);
        headers.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
        return ResponseEntity.ok()
                             .headers(headers)
                             .body(byteArrayResource);
    }

    public static String convertToRuby(String kanji, String kana) {
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

    public static String findCommonPrefix(String a, String b) {
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

    public static String findCommonSuffix(String a, String b) {
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

    public static boolean containsKanji(String input) {
        for (char c : input.toCharArray()) {
            if (Character.UnicodeScript.of(c) == Character.UnicodeScript.HAN) {
                return true;
            }
        }
        return false;
    }

    public static boolean isKatakana(String input) {
        for (char c : input.toCharArray()) {
            if (Character.UnicodeScript.of(c) != Character.UnicodeScript.KATAKANA) {
                return false;
            }
        }
        return true;
    }

    public static Optional<String> translateKatakanaToEnglish(String katakana) {
        String cachedEnglish = cache.get(katakana);
        if (cachedEnglish != null) {
            return Optional.of(cachedEnglish);
        }
        System.out.println(katakana);
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                                             .uri(URI.create(
                                                     "https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=ja&tl=en&q=" +
                                                     URLEncoder.encode(katakana, StandardCharsets.UTF_8)))
                                             .header("User-Agent",
                                                     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
                                             .header("sec-ch-ua",
                                                     "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"")
                                             .header("sec-ch-ua-mobile", "?0")
                                             .header("sec-ch-ua-platform", "\"Windows\"")
                                             .header("Accept", "*/*")
                                             .header("X-Client-Data",
                                                     "CJG2yQEIo7bJAQipncoBCJuFywEIlqHLAQiFoM0BCMaFzgEIpqLOARj0yc0B")
                                             .header("Sec-Fetch-Site", "none")
                                             .header("Sec-Fetch-Mode", "cors")
                                             .header("Sec-Fetch-Dest", "empty")
                                             .header("Accept-Language", "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,ja;q=0.6")
                                             .header("Cookie",
                                                     "GOOGLE_ABUSE_EXEMPTION=ID=42068bc4fac40f89:TM=1719908829:C=r:IP=122.216.83.146-:S=YEFlYXonELEhqp9k2PWZ6-g")
                                             .GET()
                                             .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String responseBody = response.body();
            String english = parseTranslationResponse(responseBody);
            cache.put(katakana, english);

            TimeUnit.MILLISECONDS.sleep(1);
            if (english.isBlank()) {
                return Optional.empty();
            }
            return Optional.of(english);
        } catch (Exception e) {
            return Optional.empty();
        }
    }


    private static String parseTranslationResponse(String responseBody) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(responseBody);
        JsonNode translationNode = rootNode.get(0).get(0).get(0);
        return translationNode.asText();
    }

}
