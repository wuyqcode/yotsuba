package io.github.dutianze.yotsuba.note.domain.repository;

import io.github.dutianze.yotsuba.note.domain.MediaNote;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteId;
import org.springframework.data.repository.CrudRepository;

public interface MediaNoteRepository extends CrudRepository<MediaNote, NoteId> {
}

