package io.github.dutianze.yotsuba.note.infrastructure;

import io.github.dutianze.yotsuba.file.FileResourceId;
import io.github.dutianze.yotsuba.note.domain.service.ExtractService;
import java.util.LinkedHashSet;
import org.commonmark.node.AbstractVisitor;
import org.commonmark.node.Image;
import org.commonmark.node.Node;
import org.commonmark.parser.Parser;
import org.springframework.stereotype.Service;

@Service
public class MarkdownExtractServiceImpl implements ExtractService {

  @Override
  public LinkedHashSet<FileResourceId> extractFileReferenceIds(String markdown) {
    Parser parser = Parser.builder().build();
    Node document = parser.parse(markdown);

    LinkedHashSet<FileResourceId> fileReferenceIds = new LinkedHashSet<>();
    document.accept(new AbstractVisitor() {
      @Override
      public void visit(Image image) {
        String url = image.getDestination();
        FileResourceId fileId = FileResourceId.extractIdFromUrl(url);
        if (fileId != null) {
          fileReferenceIds.add(fileId);
        }
      }
    });
    return fileReferenceIds;
  }
}
