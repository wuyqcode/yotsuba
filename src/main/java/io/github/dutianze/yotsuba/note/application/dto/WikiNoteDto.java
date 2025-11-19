package io.github.dutianze.yotsuba.note.application.dto;

import jakarta.annotation.Nonnull;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

  private boolean initial;

  private String cover;

  private List<TagDto> tags;

  private List<CommentDto> comments;

  private LocalDateTime createdAt;

  private LocalDateTime updatedAt;
}
