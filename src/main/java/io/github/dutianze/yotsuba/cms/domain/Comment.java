package io.github.dutianze.yotsuba.cms.domain;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * @author dutianze
 * @date 月曜日/2024/07/29
 */
@Data
@Entity
@Table
public class Comment {

    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "id"))
    private CommentId id;

    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Nullable
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Nullable
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Comment(String content, Post post) {
        this.id = new CommentId();
        this.content = content;
    }

}
