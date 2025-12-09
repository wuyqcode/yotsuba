package io.github.dutianze.yotsuba.music.domain.valueobject;

import io.hypersistence.tsid.TSID;
import jakarta.persistence.Embeddable;
import org.springframework.util.Assert;

@Embeddable
public record MusicId(String id) {

  public MusicId {
    Assert.notNull(id, "id must not be null");
  }

  public MusicId() {
    this(TSID.Factory.getTsid().toString());
  }
}

