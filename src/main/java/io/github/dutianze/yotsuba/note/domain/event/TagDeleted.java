package io.github.dutianze.yotsuba.note.domain.event;

import io.github.dutianze.yotsuba.note.domain.valueobject.TagId;
import org.jmolecules.event.types.DomainEvent;

public record TagDeleted(TagId tagId) implements DomainEvent {

}

