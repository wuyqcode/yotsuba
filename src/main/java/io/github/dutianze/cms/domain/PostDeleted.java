package io.github.dutianze.cms.domain;

import org.jmolecules.event.types.DomainEvent;

/**
 * @author dutianze
 * @date 2024/9/8
 */
public record PostDeleted(PostId postId) implements DomainEvent {
}
