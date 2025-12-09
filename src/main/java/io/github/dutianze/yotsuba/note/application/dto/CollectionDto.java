package io.github.dutianze.yotsuba.note.application.dto;

import jakarta.annotation.Nonnull;

public record CollectionDto(
    @Nonnull String id,
    @Nonnull String name,
    boolean system
) {

}

