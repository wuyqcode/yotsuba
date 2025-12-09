package io.github.dutianze.yotsuba.music.domain;

import io.github.dutianze.yotsuba.music.domain.valueobject.MusicId;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "music_favorite", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"song_id", "source"})
})
public class Music {

  @EmbeddedId
  @AttributeOverride(name = "id", column = @Column(name = "id"))
  private MusicId id;

  @Column(name = "song_id", nullable = false)
  private String songId;

  @Column(name = "source", nullable = false)
  private String source;

  @Column(name = "name", nullable = false)
  private String name;

  @Column(name = "artist", length = 1000)
  private String artist; // JSON string for array

  @Column(name = "album")
  private String album;

  @Column(name = "pic_id")
  private String picId;

  @Column(name = "lyric_id")
  private String lyricId;

  @CreationTimestamp
  @Column(name = "added_at", nullable = false, updatable = false)
  private LocalDateTime addedAt;

  public static Music create(String songId, String source, String name, String artist, 
                             String album, String picId, String lyricId) {
    Music music = new Music();
    music.id = new MusicId();
    music.songId = songId;
    music.source = source;
    music.name = name;
    music.artist = artist;
    music.album = album;
    music.picId = picId;
    music.lyricId = lyricId;
    return music;
  }
}

