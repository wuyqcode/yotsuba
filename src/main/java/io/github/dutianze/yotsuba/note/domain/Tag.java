package io.github.dutianze.yotsuba.note.domain;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.TreeSet;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@Entity
@Table
@NoArgsConstructor
public class Tag implements Comparable<Tag> {

  @EmbeddedId
  @AttributeOverride(name = "id", column = @Column(name = "id"))
  private TagId id;

  private String name;

  @ManyToMany(mappedBy = "tags")
  private Set<Note> notes = new TreeSet<>();

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "collection_id")
  private Collection collection;

  @Nullable
  @CreationTimestamp
  private LocalDateTime createdAt;

  @Nullable
  @UpdateTimestamp
  private LocalDateTime updatedAt;

  public Tag(String name) {
    this.id = new TagId();
    this.name = name;
  }

  @Override
  public int compareTo(Tag o) {
    return this.name.compareTo(o.name);
  }
}
