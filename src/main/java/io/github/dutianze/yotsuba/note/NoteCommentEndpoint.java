package io.github.dutianze.yotsuba.note;

import com.vaadin.hilla.Endpoint;
import io.github.dutianze.yotsuba.note.domain.Comment;
import io.github.dutianze.yotsuba.note.domain.CommentRepository;
import io.github.dutianze.yotsuba.note.domain.Note;
import io.github.dutianze.yotsuba.note.domain.NoteRepository;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteId;
import io.github.dutianze.yotsuba.note.dto.CommentDto;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.security.PermitAll;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.time.LocalDateTime;
import java.util.List;

@Endpoint
@PermitAll
public class NoteCommentEndpoint {

    private final CommentRepository commentRepository;
    private final NoteRepository noteRepository;
    private final Sinks.Many<CommentDto> commentSink = Sinks.many().multicast().onBackpressureBuffer();

    public NoteCommentEndpoint(CommentRepository commentRepository, NoteRepository noteRepository) {
        this.commentRepository = commentRepository;
        this.noteRepository = noteRepository;
    }

    @Transactional(readOnly = true)
    public List<CommentDto> getRecentComments() {
        LocalDateTime threeDaysAgo = LocalDateTime.now().minusDays(3);

        List<Comment> comments =
                commentRepository.findByCreatedAtAfterOrderByCreatedAtDesc(threeDaysAgo);

        return comments.stream()
                       .map(CommentDto::fromEntity)
                       .toList();
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
        CommentDto commentDto = CommentDto.fromEntity(saved);
        
        // 通知所有订阅的客户端
        commentSink.tryEmitNext(commentDto);
        
        return commentDto;
    }

    /**
     * 订阅新评论的 Flux
     * 客户端可以调用此方法来接收实时评论通知
     */
    public Flux<CommentDto> subscribeToComments() {
        return commentSink.asFlux();
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
