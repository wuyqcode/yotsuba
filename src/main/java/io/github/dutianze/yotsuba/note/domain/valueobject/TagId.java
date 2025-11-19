package io.github.dutianze.yotsuba.note.domain.valueobject;

import io.hypersistence.tsid.TSID;
import jakarta.persistence.Embeddable;
import org.springframework.util.Assert;

@Embeddable
public record TagId(String id) {

  public TagId {
    Assert.notNull(id, "id must not be null");
  }

  public TagId() {
    this(TSID.Factory.getTsid().toString());
  }
}
