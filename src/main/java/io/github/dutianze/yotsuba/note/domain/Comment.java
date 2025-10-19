package io.github.dutianze.yotsuba.note.domain;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
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
@NoArgsConstructor
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
