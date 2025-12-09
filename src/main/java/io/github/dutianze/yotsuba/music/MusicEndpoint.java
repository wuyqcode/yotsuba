package io.github.dutianze.yotsuba.music;

import com.vaadin.hilla.Endpoint;
import io.github.dutianze.yotsuba.music.application.dto.MusicDto;
import io.github.dutianze.yotsuba.music.domain.Music;
import io.github.dutianze.yotsuba.music.domain.repository.MusicRepository;
import io.github.dutianze.yotsuba.music.domain.valueobject.MusicId;
import io.github.dutianze.yotsuba.note.dto.PageDto;
import jakarta.annotation.security.PermitAll;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;

@Endpoint
@PermitAll
public class MusicEndpoint {

  private final MusicRepository musicRepository;

  public MusicEndpoint(MusicRepository musicRepository) {
    this.musicRepository = musicRepository;
  }

  /**
   * -------- Query --------
   **/
  @Transactional(readOnly = true)
  public PageDto<MusicDto> findAll(int page, int size) {
    Page<Music> musicPage = musicRepository.findAllOrderByAddedAtDesc(PageRequest.of(page, size));
    Page<MusicDto> dtoPage = musicPage.map(this::toDto);
    return PageDto.from(dtoPage);
  }

  @Transactional(readOnly = true)
  public MusicDto findById(String id) {
    Music music = musicRepository.findById(new MusicId(id))
        .orElseThrow(() -> new EntityNotFoundException("Music with ID " + id + " not found"));
    return toDto(music);
  }

  @Transactional(readOnly = true)
  public boolean existsBySongIdAndSource(String songId, String source) {
    return musicRepository.existsBySongIdAndSource(songId, source);
  }

  /**
   * -------- Command --------
   **/
  @Transactional
  public MusicDto addFavorite(String songId, String source, String name, String artist,
                              String album, String picId, String lyricId) {
    // 检查是否已存在
    var existing = musicRepository.findBySongIdAndSource(songId, source);
    if (existing.isPresent()) {
      return toDto(existing.get());
    }

    Music music = Music.create(songId, source, name, artist, album, picId, lyricId);
    Music saved = musicRepository.save(music);
    return toDto(saved);
  }

  @Transactional
  public void removeFavorite(String songId, String source) {
    musicRepository.findBySongIdAndSource(songId, source)
        .ifPresent(musicRepository::delete);
  }

  @Transactional
  public void deleteById(String id) {
    Music music = musicRepository.findById(new MusicId(id))
        .orElseThrow(() -> new EntityNotFoundException("Music with ID " + id + " not found"));
    musicRepository.delete(music);
  }

  private MusicDto toDto(Music music) {
    return MusicDto.builder()
        .id(music.getId().id())
        .songId(music.getSongId())
        .source(music.getSource())
        .name(music.getName())
        .artist(music.getArtist())
        .album(music.getAlbum())
        .picId(music.getPicId())
        .lyricId(music.getLyricId())
        .addedAt(music.getAddedAt() != null 
            ? music.getAddedAt().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
            : null)
        .build();
  }
}

