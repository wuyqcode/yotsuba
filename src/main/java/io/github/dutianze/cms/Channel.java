package io.github.dutianze.cms;

import org.jmolecules.ddd.types.AggregateRoot;
import org.springframework.data.domain.AbstractAggregateRoot;
import org.springframework.util.Assert;

import java.time.LocalDateTime;

/**
 * @author dutianze
 * @date 2023/9/16
 */
public class Channel extends AbstractAggregateRoot<Channel> implements AggregateRoot<Channel, ChannelId> {

    private ChannelId id;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Channel(String name) {
        Assert.notNull(name, "name must not be null");
        this.id = new ChannelId();
        this.name = name;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public ChannelId getId() {
        return id;
    }
}
