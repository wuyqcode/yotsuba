package io.github.dutianze.yotsuba.note.domain;

import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionId;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;

public interface NoteRepository extends CrudRepository<Note, NoteId> {

  Page<Note> findAllByCollection_Id(CollectionId collectionId, Pageable pageable);

}
