package io.github.dutianze.yotsuba.note.application;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.Endpoint;
import io.github.dutianze.yotsuba.note.application.dto.TagDto;
import io.github.dutianze.yotsuba.note.domain.*;
import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionId;
import jakarta.persistence.EntityNotFoundException;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Endpoint
@AnonymousAllowed
public class TagService {

    private final TagRepository tagRepository;
    private final CollectionRepository collectionRepository;

    public TagService(TagRepository tagRepository, CollectionRepository collectionRepository) {
        this.tagRepository = tagRepository;
        this.collectionRepository = collectionRepository;
    }

    @Transactional(readOnly = true)
    public List<TagDto> findAllTags() {
        return tagRepository
                .findAll(Sort.by(Sort.Order.asc("createdAt")))
                .stream()
                .map(t -> new TagDto(t.getId().id(), t.getName()))
                .collect(Collectors.toList());
    }

    @Transactional
    public TagDto createTag(String collectionId, String name) {
        if (StringUtils.isBlank(name)) {
            throw new IllegalArgumentException("Tag title cannot be empty");
        }

        Collection collection = collectionRepository
                .findById(new CollectionId(collectionId))
                .orElseThrow(() -> new EntityNotFoundException("Collection not found: " + collectionId));

        Tag tag = Tag.create(name);
        tag.setCollection(collection);
        tagRepository.save(tag);

        return new TagDto(tag.getId().id(), tag.getName());
    }


    @Transactional
    public void updateTag(String id, String name) {
        Tag tag = tagRepository.findById(new TagId(id))
                               .orElseThrow(() -> new EntityNotFoundException("Tag not found: " + id));

        tag.setName(name);
    }

    @Transactional
    public void deleteTag(String id) {
        Tag tag = tagRepository.findById(new TagId(id))
                               .orElseThrow(() -> new EntityNotFoundException("Tag not found: " + id));

        tagRepository.delete(tag);
    }
}
