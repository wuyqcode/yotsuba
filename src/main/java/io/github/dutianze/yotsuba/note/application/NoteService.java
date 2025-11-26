package io.github.dutianze.yotsuba.note.application;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.Endpoint;
import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.note.application.dto.*;
import io.github.dutianze.yotsuba.note.domain.Collection;
import io.github.dutianze.yotsuba.note.domain.MediaNote;
import io.github.dutianze.yotsuba.note.domain.Note;
import io.github.dutianze.yotsuba.note.domain.Tag;
import io.github.dutianze.yotsuba.note.domain.repository.CollectionRepository;
import io.github.dutianze.yotsuba.note.domain.repository.MediaNoteRepository;
import io.github.dutianze.yotsuba.note.domain.repository.NoteRepository;
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

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
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

    public NoteService(NoteRepository noteRepository, NoteSearch noteSearch,
                       @Qualifier("htmlExtractServiceImpl") ExtractService extractService,
                       NoteAssembler noteAssembler, MediaNoteRepository mediaNoteRepository,
                       CollectionRepository collectionRepository, TagRepository tagRepository) {
        this.noteRepository = noteRepository;
        this.noteSearch = noteSearch;
        this.extractService = extractService;
        this.noteAssembler = noteAssembler;
        this.mediaNoteRepository = mediaNoteRepository;
        this.collectionRepository = collectionRepository;
        this.tagRepository = tagRepository;
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
    public PageDto<NoteCardDto> searchNotes(String collectionId, String searchText, List<String> tagIdList, int page,
                                            int size) {
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
        Set<Tag> newTags = tagIds.stream()
                                 .map(TagId::new)
                                 .map(tagRepository::findById)
                                 .filter(Optional::isPresent)
                                 .map(Optional::get)
                                 .collect(Collectors.toSet());
        note.getTags().clear();
        note.getTags().addAll(newTags);
        noteRepository.save(note);
    }
}
