package io.github.dutianze.yotsuba.cms.application.dto;

import io.github.dutianze.yotsuba.cms.domain.Comment;

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
