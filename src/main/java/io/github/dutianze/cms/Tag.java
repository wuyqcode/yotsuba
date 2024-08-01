package io.github.dutianze.cms;

import org.jmolecules.ddd.types.AggregateRoot;
import org.springframework.data.domain.AbstractAggregateRoot;

import java.time.LocalDateTime;

/**
 * @author dutianze
 */
public class Tag extends AbstractAggregateRoot<Tag> implements AggregateRoot<Tag, TagId>, Comparable<Tag> {

    private TagId id;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Tag(String name) {
        this.id = new TagId();
        this.name = name;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public int compareTo(Tag o) {
        return this.name.compareTo(o.getName());
    }

    @Override
    public TagId getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
