package io.github.dutianze.yotsuba.cms.domain;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.jmolecules.ddd.types.AggregateRoot;
import org.springframework.data.domain.AbstractAggregateRoot;

import javax.annotation.Nullable;
import java.time.LocalDateTime;

/**
 * @author dutianze
 */
public class Tag extends AbstractAggregateRoot<Tag> implements AggregateRoot<Tag, TagId>, Comparable<Tag> {

    private TagId id;

    private String name;

    @Nullable
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Nullable
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Tag(String name) {
        this.id = new TagId();
        this.name = name;
    }

    @Override
    public int compareTo(Tag o) {
        return this.name.compareTo(o.name);
    }

    @Override
    public TagId getId() {
        return id;
    }

    public void setId(TagId id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Nullable
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(@Nullable LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Nullable
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(@Nullable LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
