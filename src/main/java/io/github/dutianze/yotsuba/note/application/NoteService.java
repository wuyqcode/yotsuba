package io.github.dutianze.yotsuba.note.application;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.Endpoint;
import io.github.dutianze.yotsuba.file.FileResourceId;
import io.github.dutianze.yotsuba.note.application.dto.MediaNoteDto;
import io.github.dutianze.yotsuba.note.application.dto.NoteAssembler;
import io.github.dutianze.yotsuba.note.application.dto.NoteCardDto;
import io.github.dutianze.yotsuba.note.application.dto.PageDto;
import io.github.dutianze.yotsuba.note.application.dto.WikiNoteDto;
import io.github.dutianze.yotsuba.note.domain.*;
import io.github.dutianze.yotsuba.note.domain.repository.CollectionRepository;
import io.github.dutianze.yotsuba.note.domain.repository.MediaNoteRepository;
import io.github.dutianze.yotsuba.note.domain.repository.NoteRepository;
import io.github.dutianze.yotsuba.note.domain.repository.TagGraphEdgeRepository;
import io.github.dutianze.yotsuba.note.domain.repository.TagRepository;
import io.github.dutianze.yotsuba.note.domain.service.ExtractService;
import io.github.dutianze.yotsuba.note.domain.valueobject.*;
import io.github.dutianze.yotsuba.search.NoteSearch;
import jakarta.annotation.Nonnull;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Endpoint
@AnonymousAllowed
public class NoteService {

    private final NoteRepository noteRepository;
    private final NoteSearch noteSearch;
    private final ExtractService extractService;
    private final NoteAssembler noteAssembler;
    private final MediaNoteRepository mediaNoteRepository;
    private final CollectionRepository collectionRepository;
    private final TagRepository tagRepository;
    private final TagGraphEdgeRepository tagGraphEdgeRepository;

    public NoteService(NoteRepository noteRepository, NoteSearch noteSearch,
                       @Qualifier("htmlExtractServiceImpl") ExtractService extractService,
                       NoteAssembler noteAssembler, MediaNoteRepository mediaNoteRepository,
                       CollectionRepository collectionRepository, TagRepository tagRepository,
                       TagGraphEdgeRepository tagGraphEdgeRepository) {
        this.noteRepository = noteRepository;
        this.noteSearch = noteSearch;
        this.extractService = extractService;
        this.noteAssembler = noteAssembler;
        this.mediaNoteRepository = mediaNoteRepository;
        this.collectionRepository = collectionRepository;
        this.tagRepository = tagRepository;
        this.tagGraphEdgeRepository = tagGraphEdgeRepository;
    }

    /**
     * -------- Query --------
     **/
    @Transactional(readOnly = true)
    public WikiNoteDto findWikiNoteById(String id) {
        Note note = noteRepository.findById(new NoteId(id))
                                  .orElseThrow(() -> new EntityNotFoundException("Note with ID " + id + " not found"));
        return noteAssembler.toWikiDto(note);
    }

    public MediaNoteDto findMediaNoteById(String id) {
        MediaNote mediaNote = mediaNoteRepository.findById(new NoteId(id))
                                                 .orElseThrow(() -> new EntityNotFoundException(
                                                         "MediaNote with ID " + id + " not found"));
        return noteAssembler.toMediaDto(mediaNote);
    }

    @Transactional(readOnly = true)
    public PageDto<NoteCardDto> searchNotes(String collectionId, String searchText, List<String> tagIdList, int page, int size) {
        List<TagId> tagIds = tagIdList.stream().map(TagId::new).toList();
        Page<NoteCardDto> dtoPage =
                noteSearch.search(new CollectionId(collectionId), tagIds, searchText, PageRequest.of(page, size));
        return PageDto.from(dtoPage);
    }

    /**
     * -------- Command --------
     **/
    @Transactional
    public String createNote(String collectionId, NoteType noteType) {
        Collection collection = collectionRepository.findById(new CollectionId(collectionId)).orElseThrow();
        Note note = Note.init(collection, noteType);
        return noteRepository.save(note).getId().id();
    }

    @Transactional
    public void updateNote(@Nonnull String id, @Nonnull String title, @Nonnull String content) {
        Note note = noteRepository.findById(new NoteId(id))
                                  .orElseThrow(() -> new EntityNotFoundException("Note not found: " + id));
        LinkedHashSet<FileResourceId> oldRefs =
                extractService.extractFileReferenceIds(note.getContent().content());
        LinkedHashSet<FileResourceId> newRefs =
                extractService.extractFileReferenceIds(content);

        note.rename(new NoteTitle(title));
        note.refreshContent(new NoteContent(content), oldRefs, newRefs);
        note.markAsInitialized();
        noteRepository.save(note);
    }

    @Transactional
    public void deleteNote(String id) {
        noteRepository.findById(new NoteId(id))
                      .ifPresentOrElse(noteRepository::delete,
                                       () -> {
                                           throw new EntityNotFoundException("Note not found: " + id);
                                       });
    }

    @Transactional
    public void updateNoteTags(@Nonnull String id, @Nonnull List<String> tagIds) {
        Note note = noteRepository.findById(new NoteId(id))
                                  .orElseThrow(() -> new EntityNotFoundException("Note not found: " + id));

        // 获取旧的标签集合
        Set<Tag> oldTags = new HashSet<>(note.getTags());

        Set<Tag> newTags = tagIds.stream()
                                 .map(TagId::new)
                                 .map(tagRepository::findById)
                                 .filter(java.util.Optional::isPresent)
                                 .map(java.util.Optional::get)
                                 .collect(Collectors.toSet());

        CollectionId collectionId = note.getCollection().getId();

        // 计算标签对EdgeId
        Function<Set<Tag>, Set<TagGraphEdgeId>> calculateEdgeIds = tags -> {
            Set<TagGraphEdgeId> edgeIds = new HashSet<>();
            List<Tag> tagList = new ArrayList<>(tags);
            for (int i = 0; i < tagList.size(); i++) {
                for (int j = i + 1; j < tagList.size(); j++) {
                    TagId sourceId = tagList.get(i).getId();
                    TagId targetId = tagList.get(j).getId();
                    edgeIds.add(new TagGraphEdgeId(sourceId, targetId, collectionId));
                }
            }
            return edgeIds;
        };

        Set<TagGraphEdgeId> oldEdgeIds = calculateEdgeIds.apply(oldTags);
        Set<TagGraphEdgeId> newEdgeIds = calculateEdgeIds.apply(newTags);

        // 找出新增的标签对
        Set<TagGraphEdgeId> addedEdgeIds = new HashSet<>(newEdgeIds);
        addedEdgeIds.removeAll(oldEdgeIds);

        // 找出移除的标签对
        Set<TagGraphEdgeId> removedEdgeIds = new HashSet<>(oldEdgeIds);
        removedEdgeIds.removeAll(newEdgeIds);

        // 处理新增的标签对：增加或创建边
        for (TagGraphEdgeId edgeId : addedEdgeIds) {
            tagGraphEdgeRepository.findById(edgeId)
                    .ifPresentOrElse(
                            edge -> {
                                edge.increaseWeight(1);
                                tagGraphEdgeRepository.save(edge);
                            },
                            () -> {
                                TagGraphEdge edge = TagGraphEdge.create(
                                        edgeId.getSourceTagId(),
                                        edgeId.getTargetTagId(),
                                        edgeId.getCollectionId(),
                                        1);
                                tagGraphEdgeRepository.save(edge);
                            }
                    );
        }

        // 处理移除的标签对：减少或删除边
        for (TagGraphEdgeId edgeId : removedEdgeIds) {
            tagGraphEdgeRepository.findById(edgeId).ifPresent(edge -> {
                edge.increaseWeight(-1);
                if (edge.getWeight() <= 0) {
                    tagGraphEdgeRepository.delete(edge);
                } else {
                    tagGraphEdgeRepository.save(edge);
                }
            });
        }

        note.getTags().clear();
        note.getTags().addAll(newTags);
        noteRepository.save(note);
    }
}
