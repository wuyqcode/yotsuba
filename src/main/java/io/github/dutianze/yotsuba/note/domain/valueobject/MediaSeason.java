package io.github.dutianze.yotsuba.note.domain.valueobject;

import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaSeason {

  private String name;
  private String year;
  private List<MediaEpisode> episodes = new ArrayList<>();
}
