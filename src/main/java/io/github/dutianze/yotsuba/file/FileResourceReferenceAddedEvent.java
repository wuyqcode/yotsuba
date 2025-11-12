package io.github.dutianze.yotsuba.file;

import io.github.dutianze.yotsuba.shared.common.FileReferenceId;
import io.github.dutianze.yotsuba.shared.common.ReferenceType;
import org.jmolecules.event.types.DomainEvent;

public record FileResourceReferenceAddedEvent(
        FileReferenceId fileReferenceId, ReferenceType referenceType, FileResourceId fileResourceId)
        implements DomainEvent {

    public static FileResourceReferenceAddedEvent forNoteContent(FileReferenceId fileReferenceId,
                                                                 FileResourceId resourceId) {
        return new FileResourceReferenceAddedEvent(
                fileReferenceId,
                ReferenceType.NOTE_CONTENT,
                resourceId
        );
    }
}
