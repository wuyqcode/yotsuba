package io.github.dutianze.yotsuba.note.domain.event;

import io.github.dutianze.yotsuba.note.domain.valueobject.NoteId;
import org.jmolecules.event.types.DomainEvent;

public record NoteUpdatedEvent(NoteId noteId) implements DomainEvent {

}
