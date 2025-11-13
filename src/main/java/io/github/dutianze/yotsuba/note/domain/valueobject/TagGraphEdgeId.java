package io.github.dutianze.yotsuba.note.domain.valueobject;

import io.github.dutianze.yotsuba.note.domain.TagId;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

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
}

