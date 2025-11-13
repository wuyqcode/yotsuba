package io.github.dutianze.yotsuba.note.domain;

import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionCategory;
import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionCategoryConverter;
import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionId;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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

  @Convert(converter = CollectionCategoryConverter.class)
  @Column(name = "category", nullable = false)
  private CollectionCategory category;

  @CreationTimestamp
  private LocalDateTime createdAt;

  @UpdateTimestamp
  private LocalDateTime updatedAt;

  public static Collection create(String name) {
    Collection collection = new Collection();
    collection.id = new CollectionId();
    collection.name = name;
    collection.category = CollectionCategory.USER_DEFINED;
    return collection;
  }
}
