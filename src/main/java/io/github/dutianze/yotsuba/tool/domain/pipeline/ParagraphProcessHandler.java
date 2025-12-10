package io.github.dutianze.yotsuba.tool.domain.pipeline;

import io.github.dutianze.yotsuba.tool.domain.policy.PolicyManager;
import nl.siegmann.epublib.domain.Book;
import nl.siegmann.epublib.domain.Resource;
import nl.siegmann.epublib.domain.SpineReference;
import org.apache.commons.lang3.StringUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;
import org.jsoup.parser.Parser;
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
                Document doc = Jsoup.parse(new String(resource.getData(), resource.getInputEncoding()), Parser.xmlParser());
                Elements paragraphs = doc.select("p");
                for (Element paragraph : paragraphs) {

                    StringBuilder newHtml = new StringBuilder();

                    for (Node node : paragraph.childNodes()) {
                        if (node instanceof TextNode textNode) {
                            String text = textNode.text();
                            if (StringUtils.isBlank(text)) {
                                newHtml.append(text);
                                continue;
                            }
                            String converted = policyManager.convert(text, input.englishContext());
                            newHtml.append(converted);
                        } else {
                            newHtml.append(node.outerHtml());
                        }
                    }
                    paragraph.html(newHtml.toString());
                }
                resource.setData(doc.outerHtml().getBytes(StandardCharsets.UTF_8));
            }
            return input.book();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}