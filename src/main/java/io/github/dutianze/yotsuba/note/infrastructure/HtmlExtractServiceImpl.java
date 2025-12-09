package io.github.dutianze.yotsuba.note.infrastructure;

import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.note.domain.service.ExtractService;
import java.util.LinkedHashSet;
import org.apache.commons.lang3.StringUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

@Service
public class HtmlExtractServiceImpl implements ExtractService {

  @Override
  public LinkedHashSet<FileResourceId> extractFileReferenceIds(String content) {
    LinkedHashSet<FileResourceId> result = new LinkedHashSet<>();
    if (StringUtils.isBlank(content)) {
      return result;
    }

    Document doc = Jsoup.parse(content);
    Elements imgList = doc.select("img[src]");
    for (Element img : imgList) {
      String src = img.attr("src");
      FileResourceId id = FileResourceId.extractIdFromUrl(src);
      if (id != null) {
        result.add(id);
      }
    }
    return result;
  }
}
