package io.github.dutianze.yotsuba.note.application.dto;

import jakarta.annotation.Nonnull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WikiNoteDto {

  @Nonnull
  private String id;

  @Nonnull
  private String title;

  @Nonnull
  private String content;

  private String cover;

  private List<TagDto> tags;

  private List<CommentDto> comments;

  private LocalDateTime createdAt;

  private LocalDateTime updatedAt;
}
