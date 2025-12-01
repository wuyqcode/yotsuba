package io.github.dutianze.yotsuba.note;

import com.vaadin.hilla.Endpoint;
import io.github.dutianze.yotsuba.note.application.dto.CommentDto;
import io.github.dutianze.yotsuba.note.domain.Comment;
import io.github.dutianze.yotsuba.note.domain.Note;
import io.github.dutianze.yotsuba.note.domain.repository.CommentRepository;
import io.github.dutianze.yotsuba.note.domain.repository.NoteRepository;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteId;
import jakarta.annotation.security.PermitAll;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Endpoint
@PermitAll
public class NoteCommentEndpoint {

    private final CommentRepository commentRepository;
    private final NoteRepository noteRepository;

    public NoteCommentEndpoint(CommentRepository commentRepository, NoteRepository noteRepository) {
        this.commentRepository = commentRepository;
        this.noteRepository = noteRepository;
    }

    @Transactional(readOnly = true)
    public List<CommentDto> getComments(String noteId) {
        NoteId noteIdObj = new NoteId(noteId);
        List<Comment> comments = commentRepository.findByNoteIdOrderByCreatedAtAsc(noteIdObj);
        return comments.stream()
                .map(CommentDto::fromEntity)
                .toList();
    }

    @Transactional
    public CommentDto addComment(String noteId, String content) {
        Note note = noteRepository.findById(new NoteId(noteId))
                .orElseThrow(() -> new EntityNotFoundException("Note not found: " + noteId));

        Comment comment = new Comment(content, note);
        Comment saved = commentRepository.save(comment);

        return CommentDto.fromEntity(saved);
    }

    @Transactional
    public void deleteComment(String commentId) {
        commentRepository.findById(new io.github.dutianze.yotsuba.note.domain.valueobject.CommentId(commentId))
                .ifPresentOrElse(commentRepository::delete,
                        () -> {
                            throw new EntityNotFoundException("Comment not found: " + commentId);
                        });
    }
}

