package io.github.dutianze.file;

import io.github.dutianze.shared.common.FileReferenceId;
import org.jmolecules.event.types.DomainEvent;

/**
 * @author dutianze
 * @date 2024/9/16
 */
public record FileResourceReferenceRemovedEvent(FileReferenceId fileReferenceId, FileResourceId fileResourceId)
        implements DomainEvent {
}
