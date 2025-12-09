package io.github.dutianze.yotsuba.note.dto;

import jakarta.annotation.Nonnull;

public record CollectionDto(
    @Nonnull String id,
    @Nonnull String name,
    boolean system
) {

}

