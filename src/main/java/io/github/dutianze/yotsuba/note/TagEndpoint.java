package io.github.dutianze.yotsuba.note;

import com.vaadin.hilla.Endpoint;
import io.github.dutianze.yotsuba.file.domain.event.FileResourceReferenceAddedEvent;
import io.github.dutianze.yotsuba.file.domain.event.FileResourceReferenceRemovedEvent;
import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.file.service.FileService;
import io.github.dutianze.yotsuba.note.dto.TagDto;
import io.github.dutianze.yotsuba.note.domain.*;
import io.github.dutianze.yotsuba.note.domain.event.TagDeleted;
import io.github.dutianze.yotsuba.note.domain.CollectionRepository;
import io.github.dutianze.yotsuba.note.domain.NoteRepository;
import io.github.dutianze.yotsuba.note.domain.TagRepository;
import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionCategory;
import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionId;
import io.github.dutianze.yotsuba.note.domain.valueobject.TagId;
import io.github.dutianze.yotsuba.shared.common.FileReferenceId;
import io.github.dutianze.yotsuba.shared.common.ReferenceCategory;
import jakarta.annotation.Nullable;
import jakarta.annotation.security.PermitAll;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Endpoint
@PermitAll
@RequiredArgsConstructor
public class TagEndpoint {

    private final TagRepository tagRepository;
    private final CollectionRepository collectionRepository;
    private final FileService fileService;
    private final ApplicationEventPublisher eventPublisher;
    private final NoteRepository noteRepository;

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

        // 如果返回空列表，使用输入的标签列表
        if (relatedTags.isEmpty()) {
            return tagIds.stream()
                    .map(tagRepository::findById)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .map(TagDto::fromEntity)
                    .collect(Collectors.toList());
        }

        return relatedTags.stream()
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

        // 检查同一集合内是否已存在相同名称的标签
        CollectionId collId = new CollectionId(collectionId);
        tagRepository.findByCollectionIdAndName(collId, name)
                .ifPresent(existingTag -> {
                    throw new IllegalArgumentException("Tag with name '" + name + "' already exists in this collection");
                });

        Tag tag = Tag.create(name);
        tag.setCollection(collection);
        tagRepository.save(tag);

        return TagDto.fromEntity(tag);
    }


    @Transactional
    public void updateTag(String id, String name) {
        if (StringUtils.isBlank(name)) {
            throw new IllegalArgumentException("Tag title cannot be empty");
        }

        Tag tag = tagRepository.findById(new TagId(id))
                               .orElseThrow(() -> new EntityNotFoundException("Tag not found: " + id));

        // 检查同一集合内是否已存在相同名称的其他标签
        CollectionId collectionId = tag.getCollection().getId();
        tagRepository.findByCollectionIdAndName(collectionId, name)
                .ifPresent(existingTag -> {
                    // 如果找到的标签不是当前要更新的标签，则抛出异常
                    if (!existingTag.getId().equals(tag.getId())) {
                        throw new IllegalArgumentException("Tag with name '" + name + "' already exists in this collection");
                    }
                });

        tag.setName(name);
        tagRepository.save(tag);
    }

    @Transactional
    public void updateTagCover(String id, String coverResourceId) {
        Tag tag = tagRepository.findById(new TagId(id))
                               .orElseThrow(() -> new EntityNotFoundException("Tag not found: " + id));

        // 获取旧的封面文件 ID
        FileResourceId oldCoverId = tag.getCover();
        FileReferenceId tagReferenceId = new FileReferenceId(id);
        
        // 如果原来有封面，发送移除事件
        if (oldCoverId != null) {
            eventPublisher.publishEvent(new FileResourceReferenceRemovedEvent(tagReferenceId, oldCoverId));
        }
        
        // 更新封面
        if (!coverResourceId.trim().isEmpty()) {
            FileResourceId newCoverId = new FileResourceId(coverResourceId);
            tag.setCover(newCoverId);
            
            // 如果新封面不为 null，发送添加事件
            eventPublisher.publishEvent(new FileResourceReferenceAddedEvent(
                    tagReferenceId,
                    ReferenceCategory.TAG_COVER,
                    newCoverId
            ));
        } else {
            tag.setCover(null);
        }
        
        tagRepository.save(tag);
    }

    @Transactional
    public void deleteTag(String id) {
        Tag tag = tagRepository.findById(new TagId(id))
                               .orElseThrow(() -> new EntityNotFoundException("Tag not found: " + id));

        // 如果 Tag 有封面，发送移除事件
        FileResourceId coverId = tag.getCover();
        if (coverId != null) {
            FileReferenceId tagReferenceId = new FileReferenceId(id);
            eventPublisher.publishEvent(new FileResourceReferenceRemovedEvent(tagReferenceId, coverId));
        }

        // 从所有关联的 Note 中移除这个 Tag
        Set<Note> notes = tag.getNotes();
        if (!notes.isEmpty()) {
            for (Note note : notes) {
                note.getTags().remove(tag);
                noteRepository.save(note);
            }
        }

        // 在删除之前发布删除事件
        eventPublisher.publishEvent(new TagDeleted(tag.getId()));

        tagRepository.delete(tag);
    }
}
