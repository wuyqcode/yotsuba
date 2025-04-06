package io.github.dutianze.yotsuba.cms.domain;

import org.jmolecules.event.types.DomainEvent;

/**
 * @author dutianze
 * @date 月曜日/2024/07/29
 */
public record PostCreated(PostId postId) implements DomainEvent {
}
