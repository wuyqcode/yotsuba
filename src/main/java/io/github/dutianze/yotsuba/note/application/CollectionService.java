package io.github.dutianze.yotsuba.note.application;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.Endpoint;
import io.github.dutianze.yotsuba.note.application.dto.CollectionDto;
import io.github.dutianze.yotsuba.note.domain.Collection;
import io.github.dutianze.yotsuba.note.domain.CollectionRepository;
import io.github.dutianze.yotsuba.note.domain.NoteRepository;
import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionCategory;
import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionId;
import jakarta.persistence.EntityNotFoundException;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Endpoint
@AnonymousAllowed
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final NoteRepository noteRepository;

    public CollectionService(CollectionRepository collectionRepository, NoteRepository noteRepository) {
        this.collectionRepository = collectionRepository;
        this.noteRepository = noteRepository;
    }

    @Transactional(readOnly = true)
    public List<CollectionDto> findAllCollections() {
        return collectionRepository
                .findAll(
                        Sort.by(
                                Sort.Order.asc("category"),
                                Sort.Order.asc("createdAt")
                        )
                )
                .stream()
                .map(c -> new CollectionDto(
                        c.getId().id(),
                        c.getName(),
                        c.getCategory().isSystem()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public CollectionDto createCollection(String name) {
        if (StringUtils.isBlank(name)) {
            throw new IllegalArgumentException("Collection name cannot be empty");
        }
        Collection c = Collection.create(name);
        collectionRepository.save(c);
        return new CollectionDto(c.getId().id(), c.getName(), c.getCategory().isSystem()
        );
    }

    @Transactional
    public void updateCollection(String id, String name) {
        Collection c = collectionRepository.findById(new CollectionId(id))
                                           .orElseThrow(
                                                   () -> new EntityNotFoundException("Collection not found: " + id));

        if (c.getCategory().isSystem()) {
            throw new IllegalStateException("系统集合不可编辑");
        }

        c.setName(name);
    }


    @Transactional
    public void deleteCollection(String id) {
        Collection c = collectionRepository.findById(new CollectionId(id))
                                           .orElseThrow(
                                                   () -> new EntityNotFoundException("Collection not found: " + id));

        if (c.getCategory().isSystem()) {
            throw new IllegalStateException("系统集合不可删除");
        }

        noteRepository.transferNotesTo(id, CollectionCategory.SYSTEM_TRASH.name());

        collectionRepository.delete(c);
    }

}
