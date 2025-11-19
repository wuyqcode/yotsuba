package io.github.dutianze.yotsuba.note.domain;


import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.dutianze.yotsuba.note.domain.converter.JsonListConverter;
import io.github.dutianze.yotsuba.note.domain.valueobject.MediaSeason;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteId;
import io.github.dutianze.yotsuba.search.NoteIdentifierBridge;
import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Converter;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.search.mapper.pojo.bridge.mapping.annotation.IdentifierBridgeRef;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.DocumentId;

@Data
@Entity
@Table(name = "media_note")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaNote {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  @EmbeddedId
  @DocumentId(identifierBridge = @IdentifierBridgeRef(type = NoteIdentifierBridge.class))
  @AttributeOverride(name = "id", column = @Column(name = "id"))
  private NoteId id;

  @OneToOne
  @MapsId
  @JoinColumn(name = "id")
  private Note note;

  private Integer releaseYear;

  private Double rating;

  @Column(length = 2000)
  private String overview;

  @Convert(converter = MediaSeasonListConverter.class)
  @Column(columnDefinition = "TEXT")
  private List<MediaSeason> seasons = new ArrayList<>();


  public void updateMetadata(Integer releaseYear, Double rating, String overview,
      @Nullable List<MediaSeason> seasons) {
    this.releaseYear = releaseYear;
    this.rating = rating;
    this.overview = overview;
    this.seasons = seasons != null ? seasons : new ArrayList<>();
  }

  @Converter
  public static class MediaSeasonListConverter extends JsonListConverter<MediaSeason> {

    public MediaSeasonListConverter() {
      super(MediaSeason.class);
    }
  }
}
