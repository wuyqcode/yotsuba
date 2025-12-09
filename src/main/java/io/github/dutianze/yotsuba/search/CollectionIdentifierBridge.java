package io.github.dutianze.yotsuba.search;

import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionId;

public class CollectionIdentifierBridge extends GenericIdentifierBridge<CollectionId> {

  public CollectionIdentifierBridge() {
    super(CollectionId::id, CollectionId::new);
  }
}
