package io.github.dutianze.yotsuba.note.domain;

import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TagRepository extends JpaRepository<Tag, TagId> {

  @Query("""
    SELECT t
    FROM Tag t
    WHERE t.id.id IN (
        SELECT DISTINCT t2.id.id
        FROM Note n
        JOIN n.tags t2
        WHERE n.id.id IN (
            SELECT n2.id.id
            FROM Note n2
            JOIN n2.tags t3
            WHERE t3.id.id IN :tagIds
              AND n2.collection.id = :collectionId
            GROUP BY n2.id.id
            HAVING COUNT(DISTINCT t3.id.id) = :size
        )
    )
    """)
  List<Tag> findRelatedTagsInCollection(
      @Param("collectionId") Long collectionId,
      @Param("tagIds") List<Long> tagIds,
      @Param("size") int size,
      Sort sort
  );

}
