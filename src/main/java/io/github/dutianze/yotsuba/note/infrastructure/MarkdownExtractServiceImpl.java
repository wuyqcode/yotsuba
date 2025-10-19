package io.github.dutianze.yotsuba.note.infrastructure;

import io.github.dutianze.yotsuba.file.FileResourceId;
import io.github.dutianze.yotsuba.note.domain.MarkdownExtractService;

import org.commonmark.node.AbstractVisitor;
import org.commonmark.node.Image;
import org.commonmark.node.Node;
import org.commonmark.parser.Parser;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

/**
 * @author dutianze
 * @date 2024/9/29
 */
@Service
public class MarkdownExtractServiceImpl implements MarkdownExtractService {

    @Override
    public Set<FileResourceId> extractFileReferenceIds(String markdown) {
        Parser parser = Parser.builder().build();
        Node document = parser.parse(markdown);

        Set<FileResourceId> fileReferenceIds = new HashSet<>();
        document.accept(new AbstractVisitor() {
            @Override
            public void visit(Image image) {
                String url = image.getDestination();
                fileReferenceIds.add(FileResourceId.extractIdFromUrl(url));
            }
        });
        return fileReferenceIds;
    }
}
