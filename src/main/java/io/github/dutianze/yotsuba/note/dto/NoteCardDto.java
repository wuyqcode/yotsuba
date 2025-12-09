package io.github.dutianze.yotsuba.note.dto;

import io.github.dutianze.yotsuba.note.domain.valueobject.NoteType;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteCardDto {
  private String id;
  private String title;
  private String cover;
  private String author;
  private String snippet;
  private long likes;
  private boolean verified;
  private NoteType noteType;
  private List<String> tags;
}
