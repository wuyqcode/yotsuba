package io.github.dutianze.file;

import io.github.dutianze.shared.common.FileReferenceId;
import io.github.dutianze.shared.common.ReferenceType;
import org.jmolecules.event.types.DomainEvent;

/**
 * @author dutianze
 * @date 2024/9/16
 */
public record FileResourceReferenceAddedEvent(
        FileReferenceId fileReferenceId, ReferenceType referenceType, FileResourceId fileResourceId)
        implements DomainEvent {

    public static FileResourceReferenceAddedEvent forPostContent(FileReferenceId fileReferenceId,
                                                                 FileResourceId resourceId) {
        return new FileResourceReferenceAddedEvent(
                fileReferenceId,
                ReferenceType.POST_CONTENT,
                resourceId
        );
    }
}
