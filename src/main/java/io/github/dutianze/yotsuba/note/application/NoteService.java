package io.github.dutianze.yotsuba.note.application;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.Endpoint;
import io.github.dutianze.yotsuba.file.FileResourceId;
import io.github.dutianze.yotsuba.note.application.dto.MediaNoteDto;
import io.github.dutianze.yotsuba.note.application.dto.NoteCardDto;
import io.github.dutianze.yotsuba.note.application.dto.PageDto;
import io.github.dutianze.yotsuba.note.application.dto.WikiNoteDto;
import io.github.dutianze.yotsuba.note.domain.*;
import io.github.dutianze.yotsuba.note.domain.valueobject.*;
import io.github.dutianze.yotsuba.search.NoteSearch;
import jakarta.annotation.Nonnull;
import jakarta.persistence.EntityNotFoundException;
import org.apache.commons.lang3.StringUtils;
import org.checkerframework.checker.units.qual.C;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;

@Endpoint
@AnonymousAllowed
public class NoteService {

    private final NoteRepository noteRepository;
    private final NoteSearch noteSearch;
    private final ExtractService extractService;
    private final NoteAssembler noteAssembler;
    private final MediaNoteRepository mediaNoteRepository;
    private final CollectionRepository collectionRepository;

    public NoteService(NoteRepository noteRepository, NoteSearch noteSearch,
                       @Qualifier("htmlExtractServiceImpl") ExtractService extractService,
                       NoteAssembler noteAssembler, MediaNoteRepository mediaNoteRepository,
                       CollectionRepository collectionRepository) {
        this.noteRepository = noteRepository;
        this.noteSearch = noteSearch;
        this.extractService = extractService;
        this.noteAssembler = noteAssembler;
        this.mediaNoteRepository = mediaNoteRepository;
        this.collectionRepository = collectionRepository;
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
    public PageDto<NoteCardDto> searchNotes(String collectionId, String searchText, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        if (StringUtils.isBlank(searchText)) {
            Page<Note> notes = noteRepository.findAllByCollection_Id(new CollectionId(collectionId), pageable);
            return PageDto.from(notes.map(noteAssembler::toCardDto));

        }
        return PageDto.from(noteSearch.search(searchText, pageable));
    }

    /**
     * -------- Command --------
     **/
    @Transactional
    public String createNote(String collectionId, NoteType noteType) {
        Collection collection = collectionRepository.findById(new CollectionId(collectionId)).orElseThrow();
        Note note = Note.create(collection, new NoteTitle("untitled"), noteType);
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
}
