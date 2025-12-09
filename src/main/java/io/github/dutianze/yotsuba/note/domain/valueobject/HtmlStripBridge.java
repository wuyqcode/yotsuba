package io.github.dutianze.yotsuba.note.domain.valueobject;

import org.hibernate.search.mapper.pojo.bridge.ValueBridge;
import org.hibernate.search.mapper.pojo.bridge.runtime.ValueBridgeToIndexedValueContext;
import org.jsoup.Jsoup;

public class HtmlStripBridge implements ValueBridge<String, String> {

  @Override
  public String toIndexedValue(String html, ValueBridgeToIndexedValueContext context) {
    if (html == null) {
      return null;
    }
    return Jsoup.parse(html).text();
  }

}
