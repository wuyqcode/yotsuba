package io.github.dutianze.yotsuba.note.domain.valueobject;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TagGraphEdgeId implements Serializable {

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "id", column = @Column(name = "source_tag_id"))
    })
    private TagId sourceTagId;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "id", column = @Column(name = "target_tag_id"))
    })
    private TagId targetTagId;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "id", column = @Column(name = "collection_id"))
    })
    private CollectionId collectionId;

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }

        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        TagGraphEdgeId that = (TagGraphEdgeId) o;

        return new EqualsBuilder().append(sourceTagId, that.sourceTagId)
            .append(targetTagId, that.targetTagId).append(collectionId, that.collectionId)
            .isEquals();
    }

    @Override
    public int hashCode() {
        return new HashCodeBuilder(17, 37).append(sourceTagId).append(targetTagId)
            .append(collectionId)
            .toHashCode();
    }
}

