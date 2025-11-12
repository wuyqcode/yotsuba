package io.github.dutianze.yotsuba.note.domain;

import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionId;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteContent;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteId;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteTitle;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteType;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "collection")
public class Collection {

  @EmbeddedId
  @AttributeOverride(name = "id", column = @Column(name = "id"))
  private CollectionId id;

  private String name;

  @OneToMany(mappedBy = "collection")
  private List<Note> notes = new ArrayList<>();

  @OneToMany(mappedBy = "collection")
  private List<Tag> tags = new ArrayList<>();

  @CreationTimestamp
  private LocalDateTime createdAt;

  @UpdateTimestamp
  private LocalDateTime updatedAt;

  public static Collection create(String name) {
    Collection collection = new Collection();
    collection.id = new CollectionId();
    collection.name = name;
    return collection;
  }
}
