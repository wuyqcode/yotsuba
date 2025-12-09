package io.github.dutianze.yotsuba.note.domain.valueobject;

import io.hypersistence.tsid.TSID;
import jakarta.persistence.Embeddable;
import org.springframework.util.Assert;

@Embeddable
public record CollectionId(String id) {

  public CollectionId {
    Assert.notNull(id, "id must not be null");
  }

  public CollectionId() {
    this(TSID.Factory.getTsid().toString());
  }

  public static CollectionId all() {
    return new CollectionId("ALL");
  }
}
