package io.github.dutianze.yotsuba.cms.domain;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.TreeSet;

/**
 * @author dutianze
 */
@Data
@Entity
@Table
@NoArgsConstructor
public class Tag implements Comparable<Tag> {

    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "id"))
    private TagId id;

    private String name;

    @ManyToMany(mappedBy = "tags", fetch = FetchType.LAZY)
    private Set<Post> posts = new TreeSet<>();

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
}
