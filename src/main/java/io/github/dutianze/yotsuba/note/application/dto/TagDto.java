package io.github.dutianze.yotsuba.note.application.dto;

import io.github.dutianze.yotsuba.note.domain.Tag;
import jakarta.annotation.Nonnull;

/**
 * @author dutianze
 * @date 2024/8/21
 */
public record TagDto(
        @Nonnull
        String id,
        @Nonnull
        String name
) {
    public static TagDto fromEntity(Tag tag) {
        return new TagDto(
                tag.getId().id(),
                tag.getName()
        );
    }
}
