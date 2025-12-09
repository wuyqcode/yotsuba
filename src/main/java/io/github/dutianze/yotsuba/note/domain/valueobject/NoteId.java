package io.github.dutianze.yotsuba.note.domain.valueobject;

import io.hypersistence.tsid.TSID;
import jakarta.persistence.Embeddable;
import org.springframework.util.Assert;

@Embeddable
public record NoteId(String id) {

  public NoteId {
    Assert.notNull(id, "id must not be null");
  }

  public NoteId() {
    this(TSID.Factory.getTsid().toString());
  }
}
