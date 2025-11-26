package io.github.dutianze.yotsuba.note.application;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.Endpoint;
import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.note.application.dto.TagDto;
import io.github.dutianze.yotsuba.note.domain.*;
import io.github.dutianze.yotsuba.note.domain.repository.CollectionRepository;
import io.github.dutianze.yotsuba.note.domain.repository.TagGraphEdgeRepository;
import io.github.dutianze.yotsuba.note.domain.repository.TagRepository;
import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionId;
import io.github.dutianze.yotsuba.note.domain.valueobject.TagId;
import jakarta.annotation.Nullable;
import jakarta.persistence.EntityNotFoundException;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Endpoint
@AnonymousAllowed
public class TagService {

    private final TagRepository tagRepository;
    private final CollectionRepository collectionRepository;
    private final TagGraphEdgeRepository tagGraphEdgeRepository;

    public TagService(TagRepository tagRepository, CollectionRepository collectionRepository,
                      TagGraphEdgeRepository tagGraphEdgeRepository) {
        this.tagRepository = tagRepository;
        this.collectionRepository = collectionRepository;
        this.tagGraphEdgeRepository = tagGraphEdgeRepository;
    }

    @Transactional(readOnly = true)
    public List<TagDto> findAllTags(@Nullable String collectionId, @Nullable List<String> tagIdList) {
        CollectionId collId = collectionId != null 
                ? new CollectionId(collectionId) 
                : new CollectionId("ALL");
        
        Sort sort = Sort.by(Sort.Order.asc("createdAt"));
        
        // 如果没有提供 tagIdList，返回指定 collection 的所有标签
        if (tagIdList == null || tagIdList.isEmpty()) {
            return tagRepository
                    .findAllByCollectionId(collId, sort)
                    .stream()
                    .map(TagDto::fromEntity)
                    .collect(Collectors.toList());
        }

        // 使用图查找关联标签

        // 收集所有关联的标签ID（包括输入标签本身和它们的邻居）
        Set<TagId> relatedTagIds = new HashSet<>();
        
        // 首先添加输入的标签ID
        for (String tagIdStr : tagIdList) {
            relatedTagIds.add(new TagId(tagIdStr));
        }

        // 为每个输入的标签查找邻居
        for (String tagIdStr : tagIdList) {
            TagId tagId = new TagId(tagIdStr);
            List<TagGraphEdge> edges = tagGraphEdgeRepository.findNeighbors(tagId, collId);
            
            for (TagGraphEdge edge : edges) {
                // 添加邻居标签ID（可能是source或target）
                TagId sourceId = edge.getId().getSourceTagId();
                TagId targetId = edge.getId().getTargetTagId();
                
                if (sourceId.equals(tagId)) {
                    relatedTagIds.add(targetId);
                } else {
                    relatedTagIds.add(sourceId);
                }
            }
        }

        // 如果没有找到关联标签，返回空列表
        if (relatedTagIds.isEmpty()) {
            return Collections.emptyList();
        }

        // 查询所有关联的标签并转换为DTO
        List<TagId> tagIdList_sorted = new ArrayList<>(relatedTagIds);
        return tagIdList_sorted.stream()
                .map(tagRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                // 过滤 collectionId
                .filter(tag -> tag.getCollection() != null && tag.getCollection().getId().id().equals(collId.id()))
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
