package io.github.dutianze.yotsuba.file.domain.event;

import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.shared.common.FileReferenceId;
import org.jmolecules.event.types.DomainEvent;

public record FileResourceReferenceRemovedEvent(FileReferenceId fileReferenceId,
                                                FileResourceId fileResourceId)
    implements DomainEvent {

}
