package io.github.dutianze.yotsuba.note.domain.valueobject;

import jakarta.persistence.Embeddable;

/**
 * @author dutianze
 * @date 2024/8/3
 */
@Embeddable
public record PostTitle(String title) {
}
