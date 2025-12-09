package io.github.dutianze.yotsuba.note.dto;

import io.github.dutianze.yotsuba.note.domain.Comment;

import java.time.LocalDateTime;

public record CommentDto(
        String id,
        String content,
        String user,
        LocalDateTime createdAt,
        String noteId,
        boolean read
) {
    public static CommentDto fromEntity(Comment comment) {
        return new CommentDto(
                comment.getId().id(),
                comment.getContent(),
                "user",
                comment.getCreatedAt(),
                comment.getNote().getId().id(),
                false
        );
    }
}