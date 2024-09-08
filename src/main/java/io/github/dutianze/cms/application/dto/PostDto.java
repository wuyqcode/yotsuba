package io.github.dutianze.cms.application.dto;

import io.github.dutianze.cms.domain.Post;
import io.github.dutianze.cms.domain.valueobject.PostStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author dutianze
 * @date 2024/8/21
 */
public record PostDto(
        String id,
        String title,
        String cover,
        String content,
        PostStatus postStatus,
        List<FileResourceDto> fileResources,
        List<TagDto> tags,
        List<CommentDto> comments,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static PostDto fromEntity(Post post) {
        return new PostDto(
                post.getId().id(),
                post.getTitle(),
                post.getCover().cover(),
                post.getContent(),
                post.getPostStatus(),
                post.getFileResources().stream()
                    .map(FileResourceDto::fromEntity)
                    .collect(Collectors.toList()),
                post.getTags().stream()
                    .map(TagDto::fromEntity)
                    .collect(Collectors.toList()),
                post.getComments().stream()
                    .map(CommentDto::fromEntity)
                    .collect(Collectors.toList()),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
