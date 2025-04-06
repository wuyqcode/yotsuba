package io.github.dutianze.yotsuba.cms.domain;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.jmolecules.ddd.types.Association;
import org.jmolecules.ddd.types.Entity;

import javax.annotation.Nullable;
import java.time.LocalDateTime;

/**
 * @author dutianze
 * @date 月曜日/2024/07/29
 */
public class Comment implements Entity<Post, CommentId>, Comparable<Comment> {

    private CommentId id;

    private String content;

    private Association<Post, PostId> post;

    @Nullable
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Nullable
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Comment(String content, Post post) {
        this.id = new CommentId();
        this.content = content;
        this.post = Association.forAggregate(post);
    }

    @Override
    public CommentId getId() {
        return id;
    }

    @Override
    public int compareTo(Comment o) {
        if (this.createdAt == null || o.createdAt == null) {
            return 0;
        }
        return this.createdAt.compareTo(o.createdAt);
    }

    public void setId(CommentId id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Association<Post, PostId> getPost() {
        return post;
    }

    public void setPost(
            Association<Post, PostId> post) {
        this.post = post;
    }

    @Nullable
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(@Nullable LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Nullable
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(@Nullable LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
