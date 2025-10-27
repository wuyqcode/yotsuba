package io.github.dutianze.yotsuba.note.application.dto;

import io.github.dutianze.yotsuba.note.domain.valueobject.NoteType;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import io.github.dutianze.yotsuba.note.domain.Post;
import io.github.dutianze.yotsuba.note.domain.valueobject.PostStatus;

@Data
public class NoteDto {

    private String id;
    private String title;
    private String cover;
    private String content;
    private PostStatus postStatus;
    private String noteType;
    private List<FileResourceDto> fileResources;
    private List<TagDto> tags;
    private List<CommentDto> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 🆕 以下为 UI 展示层新增字段
    private String author;
    private boolean verified;
    private long views;
    private long likes;
    private String summary;

    public NoteDto(
            String id,
            String title,
            String cover,
            String content,
            PostStatus postStatus,
            NoteType noteType,
            List<FileResourceDto> fileResources,
            List<TagDto> tags,
            List<CommentDto> comments,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            String author,
            boolean verified,
            long views,
            long likes,
            String summary
    ) {
        this.id = id;
        this.title = title;
        this.cover = cover;
        this.content = content;
        this.postStatus = postStatus;
        this.noteType = noteType.getValue();
        this.fileResources = fileResources;
        this.tags = tags;
        this.comments = comments;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.author = author;
        this.verified = verified;
        this.views = views;
        this.likes = likes;
        this.summary = summary;
    }

    public static NoteDto fromEntity(Post post) {
        // 🧩 内容摘要自动生成（无需特殊分支）
        String summary = generateSummary(post.getContent().content());

        return new NoteDto(
                post.getId().id(),
                post.getTitle().title(),
                post.getCover().getURL(),
                post.getContent().content(),
                post.getPostStatus(),
                post.getNoteType(),
                // TODO find file resource
                List.of(),
                post.getTags().stream()
                    .map(TagDto::fromEntity)
                    .collect(Collectors.toList()),
                post.getComments().stream()
                    .map(CommentDto::fromEntity)
                    .collect(Collectors.toList()),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                "匿名作者",
                true,
                0L,
                0L,
                summary
        );
    }

    private static String generateSummary(String content) {
        if (content == null || content.isBlank()) {
            return "暂无简介";
        }
        return content.length() > 120 ? content.substring(0, 120) + "..." : content;
    }
}