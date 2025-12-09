package io.github.dutianze.yotsuba.music.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MusicDto {
  private String id;
  private String songId;
  private String source;
  private String name;
  private String artist;
  private String album;
  private String picId;
  private String lyricId;
  private Long addedAt;
}

