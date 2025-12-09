package io.github.dutianze.yotsuba.note.domain.valueobject;

import java.util.Arrays;
import lombok.Getter;

@Getter
public enum CollectionCategory {
  SYSTEM_DEFAULT(0),
  USER_DEFINED(1),
  SYSTEM_TRASH(9999);

  private final int code;

  CollectionCategory(int code) {
    this.code = code;
  }

  public static CollectionCategory fromCode(int code) {
    return Arrays.stream(values())
        .filter(c -> c.code == code)
        .findFirst()
        .orElseThrow(() ->
            new IllegalArgumentException("Unknown collection category code: " + code)
        );
  }

  public boolean isSystem() {
    return this == SYSTEM_DEFAULT || this == SYSTEM_TRASH;
  }
}

