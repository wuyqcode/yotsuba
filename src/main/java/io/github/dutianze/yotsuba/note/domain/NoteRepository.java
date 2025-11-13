package io.github.dutianze.yotsuba.note.domain;

import io.github.dutianze.yotsuba.note.domain.valueobject.NoteId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface NoteRepository extends CrudRepository<Note, NoteId> {

  @Query("""
    SELECT n
    FROM Note n
    WHERE n.collection.id.id = :collectionId
   """)
  Page<Note> findAllByCollectionId(String collectionId, Pageable pageable);


  @Modifying
  @Query("""
    UPDATE Note n
    SET n.collection.id.id  = :newCollectionId
    WHERE n.collection.id.id = :oldCollectionId
    """)
  void transferNotesTo(String oldCollectionId, String newCollectionId);
}
