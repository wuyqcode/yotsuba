package io.github.dutianze.cms.application.dto;

import io.github.dutianze.cms.domain.Comment;

/**
 * @author dutianze
 * @date 2024/8/21
 */
public record CommentDto(
        String id,
        String content
) {
    public static CommentDto fromEntity(Comment comment) {
        return new CommentDto(
                comment.getId().id(),
                comment.getContent()
        );
    }
}
