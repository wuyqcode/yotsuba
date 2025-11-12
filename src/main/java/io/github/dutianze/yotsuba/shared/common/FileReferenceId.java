package io.github.dutianze.yotsuba.shared.common;

import jakarta.persistence.Embeddable;

@Embeddable
public record FileReferenceId(String id) {
}
