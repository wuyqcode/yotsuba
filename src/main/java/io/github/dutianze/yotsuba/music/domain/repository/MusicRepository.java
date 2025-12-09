package io.github.dutianze.yotsuba.music.domain.repository;

import io.github.dutianze.yotsuba.music.domain.Music;
import io.github.dutianze.yotsuba.music.domain.valueobject.MusicId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MusicRepository extends CrudRepository<Music, MusicId> {

  @Query("""
    SELECT m
    FROM Music m
    WHERE m.songId = :songId AND m.source = :source
   """)
  Optional<Music> findBySongIdAndSource(@Param("songId") String songId, @Param("source") String source);

  @Query("""
    SELECT m
    FROM Music m
    ORDER BY m.addedAt DESC
   """)
  Page<Music> findAllOrderByAddedAtDesc(Pageable pageable);

  @Query("""
    SELECT COUNT(m) > 0
    FROM Music m
    WHERE m.songId = :songId AND m.source = :source
   """)
  boolean existsBySongIdAndSource(@Param("songId") String songId, @Param("source") String source);
}

