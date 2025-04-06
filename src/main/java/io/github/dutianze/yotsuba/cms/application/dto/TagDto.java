package io.github.dutianze.yotsuba.cms.application.dto;

import io.github.dutianze.yotsuba.cms.domain.Tag;

/**
 * @author dutianze
 * @date 2024/8/21
 */
public record TagDto(
        String id,
        String name
) {
    public static TagDto fromEntity(Tag tag) {
        return new TagDto(
                tag.getId().id(),
                tag.getName()
        );
    }
}
