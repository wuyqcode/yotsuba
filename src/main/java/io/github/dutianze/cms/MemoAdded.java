package io.github.dutianze.cms;

import org.jmolecules.event.types.DomainEvent;

/**
 * @author dutianze
 * @date 月曜日/2024/07/29
 */
public record MemoAdded(MemoId memoId) implements DomainEvent {
}
