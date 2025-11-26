package io.github.dutianze.yotsuba.note.domain.repository;

import io.github.dutianze.yotsuba.note.domain.Tag;
import io.github.dutianze.yotsuba.note.domain.valueobject.TagId;
import java.util.List;
import java.util.Optional;

import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionId;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TagRepository extends JpaRepository<Tag, TagId> {

  @Query("""
    SELECT t
    FROM Tag t
    WHERE t.collection.id = :collectionId
    """)
  List<Tag> findAllByCollectionId(CollectionId collectionId, Sort sort);

  @Query("""
    SELECT t
    FROM Tag t
    WHERE t.id.id IN (
        SELECT DISTINCT t2.id.id
        FROM Note n
        JOIN n.tags t2
        WHERE n.id IN (
            SELECT n2.id
            FROM Note n2
            JOIN n2.tags t3
            WHERE t3.id IN :tagIds
              AND n2.collection.id = :collectionId
            GROUP BY n2.id.id
            HAVING COUNT(DISTINCT t3.id) = :size
        )
    )
    """)
  List<Tag> findRelatedTagsInCollection(
      @Param("collectionId") CollectionId collectionId,
      @Param("tagIds") List<TagId> tagIds,
      @Param("size") int size,
      Sort sort
  );

  Optional<Tag> findByIdAndCollectionId(TagId tagId, CollectionId collectionId);

}
