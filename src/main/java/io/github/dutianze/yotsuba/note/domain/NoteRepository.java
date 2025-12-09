package io.github.dutianze.yotsuba.note.domain;

import io.github.dutianze.yotsuba.note.domain.valueobject.NoteId;
import io.github.dutianze.yotsuba.note.domain.valueobject.TagId;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface NoteRepository extends CrudRepository<Note, NoteId> {

  @Query("""
    SELECT n
    FROM Note n
    WHERE n.collection.id.id = :collectionId
   """)
  Page<Note> findAllByCollectionId(String collectionId, Pageable pageable);

  @Query("""
    SELECT n
    FROM Note n
    WHERE n.collection.id.id = :collectionId
      AND EXISTS (
        SELECT 1
        FROM Note n2
        JOIN n2.tags t
        WHERE n2.id = n.id
          AND t.id IN :tagIds
      )
    ORDER BY n.createdAt DESC
   """)
  Page<Note> findAllByCollectionIdAndTags(@Param("collectionId") String collectionId,
                                          @Param("tagIds") List<TagId> tagIds,
                                          Pageable pageable);

  @Modifying
  @Query("""
    UPDATE Note n
    SET n.collection.id.id  = :newCollectionId
    WHERE n.collection.id.id = :oldCollectionId
    """)
  void transferNotesTo(String oldCollectionId, String newCollectionId);
}
