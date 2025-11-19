package io.github.dutianze.yotsuba.note.domain;

import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionId;
import io.github.dutianze.yotsuba.note.domain.valueobject.TagGraphEdgeId;
import io.github.dutianze.yotsuba.note.domain.valueobject.TagId;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tag_graph_edge")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TagGraphEdge {

    @EmbeddedId
    private TagGraphEdgeId id;

    @Column(nullable = false)
    private Integer weight = 1;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public static TagGraphEdge create(TagId source, TagId target, CollectionId collectionId, int weight) {
        TagGraphEdge edge = new TagGraphEdge();
        edge.id = new TagGraphEdgeId(source, target, collectionId);
        edge.weight = weight;
        return edge;
    }

    public void increaseWeight(int delta) {
        this.weight += delta;
    }
}

