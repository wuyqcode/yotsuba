package io.github.dutianze.yotsuba.note.domain;

import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
  @JoinColumn(name = "note_id", nullable = false)
  private Note note;

  @Nullable
  @CreationTimestamp
  private LocalDateTime createdAt;

  @Nullable
  @UpdateTimestamp
  private LocalDateTime updatedAt;

  public Comment(String content, Note note) {
    this.id = new CommentId();
    this.content = content;
  }

}
