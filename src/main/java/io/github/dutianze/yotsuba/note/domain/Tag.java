package io.github.dutianze.yotsuba.note.domain;

import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.note.domain.valueobject.TagId;
import io.github.dutianze.yotsuba.search.TagIdentifierBridge;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.TreeSet;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.search.mapper.pojo.bridge.mapping.annotation.IdentifierBridgeRef;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.DocumentId;

@Data
@Entity
@Table
@NoArgsConstructor
public class Tag implements Comparable<Tag> {

  @DocumentId(identifierBridge = @IdentifierBridgeRef(type = TagIdentifierBridge.class))
  @EmbeddedId
  @AttributeOverride(name = "id", column = @Column(name = "id"))
  private TagId id;

  private String name;

  @Embedded
  @AttributeOverride(name = "id", column = @Column(name = "cover_resource_id"))
  @Nullable
  private FileResourceId cover;

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

  public static Tag create(String name) {
    Tag tag = new Tag();
    tag.id = new TagId();
    tag.name = name;
    return tag;
  }

  public static Tag create(TagId tagId, String name, Collection collection) {
    Tag tag = new Tag();
    tag.id = tagId;
    tag.name = name;
    tag.collection = collection;
    return tag;
  }

  @Override
  public int compareTo(Tag o) {
    return this.name.compareTo(o.name);
  }
}
