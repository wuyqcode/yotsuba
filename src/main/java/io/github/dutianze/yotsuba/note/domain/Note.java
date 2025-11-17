package io.github.dutianze.yotsuba.note.domain;

import io.github.dutianze.yotsuba.file.FileResourceId;
import io.github.dutianze.yotsuba.file.FileResourceReferenceAddedEvent;
import io.github.dutianze.yotsuba.file.FileResourceReferenceRemovedEvent;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteContent;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteId;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteTitle;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteType;
import io.github.dutianze.yotsuba.search.NoteIdentifierBridge;
import io.github.dutianze.yotsuba.shared.common.FileReferenceId;
import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.search.mapper.pojo.bridge.mapping.annotation.IdentifierBridgeRef;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.DocumentId;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.Indexed;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.IndexedEmbedded;
import org.springframework.data.domain.AbstractAggregateRoot;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Indexed
@Entity
@Table
public class Note extends AbstractAggregateRoot<Note> implements Comparable<Note> {

  @EmbeddedId
  @DocumentId(identifierBridge = @IdentifierBridgeRef(type = NoteIdentifierBridge.class))
  @AttributeOverride(name = "id", column = @Column(name = "id"))
  private NoteId id;

  @Embedded
  @AttributeOverride(name = "title", column = @Column(name = "title"))
  private NoteTitle title;

  @Embedded
  @AttributeOverride(name = "id", column = @Column(name = "cover_resource_id"))
  @Nullable
  private FileResourceId cover;

  @IndexedEmbedded
  private NoteContent content;

  @Column(name = "note_type")
  @Enumerated(EnumType.STRING)
  private NoteType noteType = NoteType.MEDIA;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "collection_id")
  private Collection collection;

  @OneToMany(mappedBy = "note", cascade = CascadeType.ALL, orphanRemoval = true)
  private final List<Comment> comments = new ArrayList<>();

  @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.EAGER)
  @JoinTable(
      name = "note_tag",
      joinColumns = @JoinColumn(name = "note_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id")
  )
  private final Set<Tag> tags = new TreeSet<>();

  @Nullable
  @CreationTimestamp
  private LocalDateTime createdAt;

  @Nullable
  @UpdateTimestamp
  private LocalDateTime updatedAt;

  /** ----------- 工厂方法 ----------- */
  public static Note create(Collection collection, NoteTitle title, NoteType type) {
    Note note = new Note();
    note.id = new NoteId();
    note.title = title;
    note.noteType = type;
    note.collection = collection;
    note.content = new NoteContent();
    note.registerEvent(new NoteCreated(note.id));
    return note;
  }

  public static Note createWithId(NoteId id, Collection collection, NoteTitle title, NoteType type) {
    Note note = new Note();
    note.id = id;
    note.title = title;
    note.noteType = type;
    note.collection = collection;
    note.content = new NoteContent();
    note.registerEvent(new NoteCreated(note.id));
    return note;
  }

  public static Note createWithIdAndContent(NoteId id, Collection collection, NoteTitle title,
      NoteContent content, NoteType type) {
    Note note = new Note();
    note.id = id;
    note.title = title;
    note.noteType = type;
    note.collection = collection;
    note.content = content;
    note.registerEvent(new NoteCreated(note.id));
    return note;
  }

  /** ----------- 领域行为 ----------- */
  public void rename(NoteTitle newTitle) {
    if (Objects.equals(this.title, newTitle)) {
      return;
    }
    this.title = newTitle;
    registerEvent(new NoteUpdatedEvent(this.id));
  }

  public void refreshContent(NoteContent newContent,
      LinkedHashSet<FileResourceId> oldRefs,
      LinkedHashSet<FileResourceId> newRefs) {

    if (Objects.equals(this.content, newContent) && Objects.equals(oldRefs, newRefs)) {
      return;
    }

    this.content = newContent;

    FileResourceId newCover = newRefs.isEmpty() ? null : newRefs.getFirst();
    this.updateCover(newCover);

    this.syncFileReferences(oldRefs, newRefs);
    this.registerEvent(new NoteUpdatedEvent(this.id));
  }

  /** ----------- 内部领域逻辑 ----------- */
  private void updateCover(@Nullable FileResourceId newCover) {
    if (Objects.equals(this.cover, newCover)) {
      return;
    }
    FileReferenceId ref = new FileReferenceId(this.id.id());

    Optional.ofNullable(this.cover)
        .filter(c -> !c.id().isEmpty())
        .ifPresent(c -> registerEvent(new FileResourceReferenceRemovedEvent(ref, c)));

    Optional.ofNullable(newCover)
        .filter(c -> !c.id().isEmpty())
        .ifPresent(c -> registerEvent(FileResourceReferenceAddedEvent.forNoteContent(ref, c)));

    this.cover = newCover;
  }

  private void syncFileReferences(Set<FileResourceId> oldRefs, Set<FileResourceId> newRefs) {
    FileReferenceId ref = new FileReferenceId(this.id.id());
    oldRefs.stream()
        .filter(id -> !newRefs.contains(id))
        .forEach(id -> registerEvent(new FileResourceReferenceRemovedEvent(ref, id)));
    newRefs.stream()
        .filter(id -> !oldRefs.contains(id))
        .forEach(id -> registerEvent(FileResourceReferenceAddedEvent.forNoteContent(ref, id)));
  }

  /** ----------- 比较与相等 ----------- */
  @Override
  public int compareTo(Note other) {
    return this.id.id().compareTo(other.id.id());
  }

  @Override
  public boolean equals(Object o) {
    return (o instanceof Note other) && Objects.equals(id, other.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}
