package io.github.dutianze.yotsuba.note;

import io.github.dutianze.yotsuba.note.domain.Collection;
import io.github.dutianze.yotsuba.note.domain.repository.CollectionRepository;
import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionCategory;
import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionId;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteType;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteEndpoint noteEndpoint;
    private final CollectionRepository collectionRepository;

    /**
     * 创建 Note 的请求 DTO
     */
    public record CreateNoteRequest(
            @NotBlank(message = "Title is required")
            String title,
            @NotBlank(message = "Content is required")
            String content
    ) {
    }

    /**
     * 创建 Note 的响应 DTO
     */
    public record CreateNoteResponse(
            String noteId,
            String message
    ) {
    }

    /**
     * 创建新的 Note
     * 
     * @param request 包含 title 和 content 的请求
     * @return 创建的 Note 信息
     */
    @PostMapping
    public ResponseEntity<CreateNoteResponse> createNote(@Valid @RequestBody CreateNoteRequest request) {
        try {
            // 获取默认 collection
            CollectionId defaultCollectionId = new CollectionId(CollectionCategory.SYSTEM_DEFAULT.name());
            Collection collection = collectionRepository.findById(defaultCollectionId)
                    .orElseThrow(() -> new EntityNotFoundException("Default collection not found"));

            // 创建新的 WIKI 类型的 Note
            String noteId = noteEndpoint.createNote(collection.getId().id(), NoteType.WIKI);

            // 更新 Note 的标题和内容
            noteEndpoint.updateNote(noteId, request.title(), request.content());

            log.info("Created note from script: noteId={}, title={}", noteId, request.title());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new CreateNoteResponse(noteId, "Note created successfully"));
        } catch (EntityNotFoundException e) {
            log.error("Failed to create note: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new CreateNoteResponse(null, "Default collection not found"));
        } catch (Exception e) {
            log.error("Failed to create note from script", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new CreateNoteResponse(null, "Failed to create note: " + e.getMessage()));
        }
    }
}

