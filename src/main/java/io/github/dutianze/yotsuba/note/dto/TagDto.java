package io.github.dutianze.yotsuba.note.dto;

import io.github.dutianze.yotsuba.note.domain.Tag;
import jakarta.annotation.Nonnull;
import java.util.Optional;

/**
 * @author dutianze
 * @date 2024/8/21
 */
public record TagDto(
        @Nonnull
        String id,
        @Nonnull
        String name,
        String cover
) {
    public static TagDto fromEntity(Tag tag) {
        return new TagDto(
                tag.getId().id(),
                tag.getName(),
                Optional.ofNullable(tag.getCover()).map(cover -> cover.getUrl()).orElse("")
        );
    }
}
