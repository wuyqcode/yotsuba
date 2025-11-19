package io.github.dutianze.yotsuba.search;

import io.github.dutianze.yotsuba.note.domain.valueobject.TagId;

public class TagIdentifierBridge extends GenericIdentifierBridge<TagId> {

  public TagIdentifierBridge() {
    super(TagId::id, TagId::new);
  }
}
