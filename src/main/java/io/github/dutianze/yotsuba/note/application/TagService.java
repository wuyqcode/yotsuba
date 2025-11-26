package io.github.dutianze.yotsuba.note.application;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.Endpoint;
import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.note.application.dto.TagDto;
import io.github.dutianze.yotsuba.note.domain.*;
import io.github.dutianze.yotsuba.note.domain.repository.CollectionRepository;
import io.github.dutianze.yotsuba.note.domain.repository.TagRepository;
import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionCategory;
import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionId;
import io.github.dutianze.yotsuba.note.domain.valueobject.TagId;
import jakarta.annotation.Nullable;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Endpoint
@AnonymousAllowed
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final CollectionRepository collectionRepository;

    @Transactional(readOnly = true)
    public List<TagDto> findAllTags(@Nullable String collectionId, @Nullable List<String> tagIdList) {
        CollectionId collId = collectionId != null 
                ? new CollectionId(collectionId) 
                : new CollectionId(CollectionCategory.SYSTEM_DEFAULT.name());
        
        Sort sort = Sort.by(Sort.Order.asc("createdAt"));
        
        // 如果没有提供 tagIdList，返回指定 collection 的所有标签
        if (tagIdList == null || tagIdList.isEmpty()) {
            return tagRepository
                    .findAllByCollectionId(collId, sort)
                    .stream()
                    .map(TagDto::fromEntity)
                    .collect(Collectors.toList());
        }

        List<TagId> tagIds = tagIdList.stream().map(TagId::new).collect(Collectors.toList());
        List<Tag> relatedTags = tagRepository.findRelatedTagsInCollection(
                collId,
                tagIds,
                tagIds.size(),
                sort
        );

        return relatedTags.stream()
                .filter(tag -> tag.getCollection().getId().equals(collId))
                .sorted(Comparator.comparing(Tag::getCreatedAt))
                .map(TagDto::fromEntity)
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

        return TagDto.fromEntity(tag);
    }


    @Transactional
    public void updateTag(String id, String name) {
        Tag tag = tagRepository.findById(new TagId(id))
                               .orElseThrow(() -> new EntityNotFoundException("Tag not found: " + id));

        tag.setName(name);
        tagRepository.save(tag);
    }

    @Transactional
    public void updateTagCover(String id, String coverResourceId) {
        Tag tag = tagRepository.findById(new TagId(id))
                               .orElseThrow(() -> new EntityNotFoundException("Tag not found: " + id));

        if (coverResourceId == null || coverResourceId.trim().isEmpty()) {
            tag.setCover(null);
        } else {
            tag.setCover(new FileResourceId(coverResourceId));
        }
        tagRepository.save(tag);
    }

    @Transactional
    public void deleteTag(String id) {
        Tag tag = tagRepository.findById(new TagId(id))
                               .orElseThrow(() -> new EntityNotFoundException("Tag not found: " + id));

        tagRepository.delete(tag);
    }
}
