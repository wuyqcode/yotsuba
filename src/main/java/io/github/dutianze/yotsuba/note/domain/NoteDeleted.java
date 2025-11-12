package io.github.dutianze.yotsuba.note.domain;

import io.github.dutianze.yotsuba.note.domain.valueobject.NoteId;
import org.jmolecules.event.types.DomainEvent;

public record NoteDeleted(NoteId noteId) implements DomainEvent {

}
