package io.github.dutianze.yotsuba.note.application.dto;

import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.note.domain.MediaNote;
import io.github.dutianze.yotsuba.note.domain.Note;
import io.github.dutianze.yotsuba.note.domain.Tag;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteContent;
import jakarta.annotation.Nullable;
import java.util.Optional;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

@Component
public class NoteAssembler {

  private NoteAssembler() {
  }

  /** 卡片用 */
  public NoteCardDto toCardDto(Note note) {
    return NoteCardDto.builder()
        .id(note.getId().id())
        .title(note.getTitle().title())
        .cover(Optional.ofNullable(note.getCover()).map(FileResourceId::getUrl).orElse(""))
        .author("匿名作者")
        .snippet(summarize(note.getContent()))
        .likes(0)
        .noteType(note.getNoteType())
        .verified(true)
        .tags(note.getTags().stream().map(Tag::getName).toList())
        .build();
  }

  /** Wiki用 */
  public WikiNoteDto toWikiDto(Note note) {
    return WikiNoteDto.builder()
        .id(note.getId().id())
        .title(note.getTitle().title())
        .initial(note.isInitial())
        .content(Optional.of(note.getContent()).map(NoteContent::content).orElse(""))
        .cover(Optional.ofNullable(note.getCover()).map(FileResourceId::getUrl).orElse(""))
        .tags(note.getTags().stream().map(TagDto::fromEntity).collect(Collectors.toList()))
        .comments(
            note.getComments().stream().map(CommentDto::fromEntity).collect(Collectors.toList()))
        .createdAt(note.getCreatedAt())
        .updatedAt(note.getUpdatedAt())
        .build();
  }

  public MediaNoteDto toMediaDto(MediaNote media) {
    Note note = media.getNote();
    return MediaNoteDto.builder()
        .id(note.getId().id())
        .title(note.getTitle().title())
        .cover(note.getCover() != null ? note.getCover().getUrl() : "")
        .noteType(note.getNoteType().name())
        .overview(media.getOverview())
        .releaseYear(media.getReleaseYear())
        .rating(media.getRating())
        .content(note.getContent() != null ? note.getContent().content() : "")
        .seasons(media.getSeasons())
        .build();
  }


  private static String summarize(@Nullable NoteContent content) {
    if (content == null || StringUtils.isBlank(content.content())) {
      return "暂无简介";
    }
    String text = content.content();
    return text.length() > 120 ? text.substring(0, 120) + "..." : text;
  }
}
