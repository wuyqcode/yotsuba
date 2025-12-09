package io.github.dutianze.yotsuba.note.domain.valueobject;

import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaEpisode {

  private String title;
  private String runtime;
  private Double rating;
  private String description;
  private FileResourceId cover;
}
