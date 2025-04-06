package io.github.dutianze.yotsuba.cms.domain;

import org.jmolecules.event.types.DomainEvent;

/**
 * @author dutianze
 * @date 2024/9/8
 */
public record PostUpdatedEvent(PostId postId) implements DomainEvent {

}
