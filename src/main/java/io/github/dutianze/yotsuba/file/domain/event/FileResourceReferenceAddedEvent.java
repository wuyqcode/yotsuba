package io.github.dutianze.yotsuba.file.domain.event;

import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.shared.common.ReferenceCategory;
import io.github.dutianze.yotsuba.shared.common.FileReferenceId;
import org.jmolecules.event.types.DomainEvent;

public record FileResourceReferenceAddedEvent(
        FileReferenceId fileReferenceId, ReferenceCategory referenceCategory,
        FileResourceId fileResourceId)
        implements DomainEvent {

  public static FileResourceReferenceAddedEvent forNoteContent(FileReferenceId fileReferenceId,
                                                               FileResourceId resourceId) {
    return new FileResourceReferenceAddedEvent(
            fileReferenceId,
            ReferenceCategory.NOTE_CONTENT,
            resourceId
    );
  }
}
