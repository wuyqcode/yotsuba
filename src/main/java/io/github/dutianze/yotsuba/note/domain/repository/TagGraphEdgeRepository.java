package io.github.dutianze.yotsuba.note.domain.repository;

import io.github.dutianze.yotsuba.note.domain.TagGraphEdge;
import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionId;
import io.github.dutianze.yotsuba.note.domain.valueobject.TagGraphEdgeId;
import io.github.dutianze.yotsuba.note.domain.valueobject.TagId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TagGraphEdgeRepository extends JpaRepository<TagGraphEdge, TagGraphEdgeId> {

    @Query("""
            SELECT e
            FROM TagGraphEdge e
            WHERE (e.id.sourceTagId = :tagId OR e.id.targetTagId = :tagId)
              AND e.id.collectionId = :collectionId
            ORDER BY e.weight DESC
            """)
    List<TagGraphEdge> findNeighbors(TagId tagId, CollectionId collectionId);
}

