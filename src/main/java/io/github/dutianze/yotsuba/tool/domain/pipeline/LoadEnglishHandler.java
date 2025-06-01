package io.github.dutianze.yotsuba.tool.domain.pipeline;

import com.atilika.kuromoji.ipadic.neologd.Token;
import com.fasterxml.jackson.databind.JsonNode;
import io.github.dutianze.yotsuba.tool.domain.common.Constant;
import io.github.dutianze.yotsuba.tool.domain.common.ListHelper;
import io.github.dutianze.yotsuba.tool.domain.common.StringHelper;
import nl.siegmann.epublib.domain.Book;
import nl.siegmann.epublib.domain.Resource;
import nl.siegmann.epublib.domain.SpineReference;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.StreamSupport;

/**
 * @author dutianze
 * @date 2024/7/9
 */
public class LoadEnglishHandler implements Handler<Book, BookContext> {

    @Override
    public BookContext process(Book input) {
        try {
            Set<String> distinctWord = new HashSet<>();
            List<SpineReference> spineReferences = input.getSpine().getSpineReferences();
            for (SpineReference spineReference : spineReferences) {
                Resource resource = spineReference.getResource();
                Document doc = Jsoup.parse(new String(resource.getData(), resource.getInputEncoding()));
                Elements paragraphs = doc.select("p");
                for (Element paragraph : paragraphs) {
                    Constant.tokenizer.tokenize(paragraph.text())
                                      .stream()
                                      .map(Token::getSurface)
                                      .filter(StringHelper::containsKatakana)
                                      .forEach(distinctWord::add);

                }
            }
            List<List<String>> batches = ListHelper.getBatches(new ArrayList<>(distinctWord), 100);
            Map<String, String> englishContext = batches
                    .stream()
                    .flatMap(batch -> {
                        List<String> translatedList = translateKatakanaToEnglish(String.join("\n", batch));
                        return IntStream.range(0, translatedList.size())
                                        .mapToObj(j -> new AbstractMap.SimpleEntry<>(batch.get(j),
                                                                                     translatedList.get(j)));
                    })
                    .collect(Collectors.toMap(AbstractMap.SimpleEntry::getKey, AbstractMap.SimpleEntry::getValue));
            return new BookContext(input, englishContext);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private List<String> translateKatakanaToEnglish(String katakana) {
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
            TimeUnit.MILLISECONDS.sleep(10);
            return parseTranslationResponse(responseBody);
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    private List<String> parseTranslationResponse(String responseBody) throws IOException {
        JsonNode rootNode = Constant.objectMapper.readTree(responseBody);
        return StreamSupport.stream(rootNode.get(0).spliterator(), false)
                            .map(element -> element.get(0).asText().trim().toLowerCase())
                            .collect(Collectors.toList());
    }
}