package io.github.dutianze.yotsuba.note.application.dto;

import io.github.dutianze.yotsuba.note.domain.Comment;

import java.time.LocalDateTime;

/**
 * @author dutianze
 * @date 2024/8/21
 */
public record CommentDto(
        String id,
        String content,
        String user,
        LocalDateTime createdAt
) {
    public static CommentDto fromEntity(Comment comment) {
        return new CommentDto(
                comment.getId().id(),
                comment.getContent(),
                "user", // TODO: 从 Comment 实体获取用户信息
                comment.getCreatedAt()
        );
    }
}
