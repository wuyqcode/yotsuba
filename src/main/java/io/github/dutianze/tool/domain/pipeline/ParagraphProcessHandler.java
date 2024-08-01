package io.github.dutianze.tool.domain.pipeline;

import io.github.dutianze.tool.domain.policy.PolicyManager;
import nl.siegmann.epublib.domain.Book;
import nl.siegmann.epublib.domain.Resource;
import nl.siegmann.epublib.domain.SpineReference;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * @author dutianze
 * @date 2024/7/5
 */
public class ParagraphProcessHandler implements Handler<BookContext, Book> {

    private final PolicyManager policyManager;

    public ParagraphProcessHandler(PolicyManager policyManager) {
        this.policyManager = policyManager;
    }

    @Override
    public Book process(BookContext input) {
        try {
            List<SpineReference> spineReferences = input.book().getSpine().getSpineReferences();
            for (SpineReference spineReference : spineReferences) {
                Resource resource = spineReference.getResource();
                Document doc = Jsoup.parse(new String(resource.getData(), resource.getInputEncoding()));
                Elements paragraphs = doc.select("p");
                for (Element paragraph : paragraphs) {
                    paragraph.select("rt").remove();
                    String convertedText = policyManager.convert(paragraph.text(), input.englishContext());
                    paragraph.empty().html(convertedText);
                }
                resource.setData(doc.html().getBytes(StandardCharsets.UTF_8));
            }
            return input.book();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
