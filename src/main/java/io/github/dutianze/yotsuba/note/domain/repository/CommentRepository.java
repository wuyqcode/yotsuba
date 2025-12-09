package io.github.dutianze.yotsuba.note.domain.repository;

import io.github.dutianze.yotsuba.note.domain.Comment;
import io.github.dutianze.yotsuba.note.domain.valueobject.CommentId;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, CommentId> {

    @Query("SELECT c FROM Comment c WHERE c.note.id = :noteId ORDER BY c.createdAt ASC")
    List<Comment> findByNoteIdOrderByCreatedAtAsc(NoteId noteId);
}

