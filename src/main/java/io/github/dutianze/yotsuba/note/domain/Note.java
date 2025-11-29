package io.github.dutianze.yotsuba.note.domain;

import io.github.dutianze.yotsuba.file.domain.event.FileResourceReferenceAddedEvent;
import io.github.dutianze.yotsuba.file.domain.event.FileResourceReferenceRemovedEvent;
import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.note.domain.event.NoteCreated;
import io.github.dutianze.yotsuba.note.domain.event.NoteDeleted;
import io.github.dutianze.yotsuba.note.domain.event.NoteUpdatedEvent;
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

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.atmosphere.interceptor.AtmosphereResourceStateRecovery.B;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.search.engine.backend.types.Sortable;
import org.hibernate.search.mapper.pojo.bridge.mapping.annotation.IdentifierBridgeRef;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.DocumentId;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.GenericField;
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

  @IndexedEmbedded
  @Embedded
  @AttributeOverride(name = "title", column = @Column(name = "title"))
  private NoteTitle title;

  @IndexedEmbedded
  private NoteContent content;

  @Embedded
  @AttributeOverride(name = "id", column = @Column(name = "cover_resource_id"))
  @Nullable
  private FileResourceId cover;

  @Column(name = "initial", nullable = false)
  private boolean initial = false;

  @Column(name = "note_type")
  @Enumerated(EnumType.STRING)
  private NoteType noteType = NoteType.MEDIA;

  @IndexedEmbedded(includeEmbeddedObjectId = true)
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "collection_id")
  private Collection collection;

  @OneToMany(mappedBy = "note", cascade = CascadeType.ALL, orphanRemoval = true)
  private final List<Comment> comments = new ArrayList<>();

  @IndexedEmbedded(includeEmbeddedObjectId = true)
  @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.EAGER)
  @JoinTable(
      name = "note_tag",
      joinColumns = @JoinColumn(name = "note_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id")
  )
  private final Set<Tag> tags = new TreeSet<>();

  @GenericField(sortable = Sortable.YES)
  @Nullable
  @CreationTimestamp
  private LocalDateTime createdAt;

  @Nullable
  @UpdateTimestamp
  private LocalDateTime updatedAt;

  public static Note init(Collection collection, NoteType type) {
    Note note = new Note();
    note.id = new NoteId();
    note.title = new NoteTitle();
    note.noteType = type;
    note.collection = collection;
    note.content = new NoteContent();
    note.initial = true;
    note.registerEvent(new NoteCreated(note.id));
    return note;
  }

  public void markAsInitialized() {
    this.initial = false;
  }

  public void markAsDeleted() {
    registerEvent(new NoteDeleted(this.id));
  }

  public static Note createWithIdAndContent(NoteId id, Collection collection, NoteTitle title,
      NoteContent content, NoteType type, FileResourceId cover, long createAt, long updateAt) {
    Note note = new Note();
    note.id = id;
    note.title = title;
    note.noteType = type;
    note.collection = collection;
    note.content = content;
    note.cover = cover;
    note.createdAt =
            LocalDateTime.ofInstant(Instant.ofEpochMilli(createAt),
                                    TimeZone.getDefault().toZoneId());
    note.updatedAt = LocalDateTime.ofInstant(Instant.ofEpochMilli(updateAt),
                                             TimeZone.getDefault().toZoneId());  ;
    note.registerEvent(new NoteCreated(note.id));
    return note;
  }

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
