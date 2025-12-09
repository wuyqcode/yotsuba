package io.github.dutianze.yotsuba.note.dto;

import io.github.dutianze.yotsuba.note.domain.valueobject.MediaSeason;
import jakarta.annotation.Nonnull;
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
public class MediaNoteDto {

  /** 来自 Note.id */
  @Nonnull
  private String id;

  /** 来自 Note.title */
  private String title;

  /** 来自 Note.cover -> 转成可用的 url/string */
  private String cover;

  /** NoteType.MEDIA / NOTE / WIKI ... */
  private String noteType;

  /** 媒体简介，对应 MediaNote.overview */
  private String overview;

  /** 上映/发布年份，对应 MediaNote.releaseYear */
  private Integer releaseYear;

  /** 评分，对应 MediaNote.rating */
  private Double rating;

  /** Note.content，富文本 */
  private String content;

  /** 媒体结构化信息 */
  @Builder.Default
  private List<MediaSeason> seasons = new ArrayList<>();

  /** 额外的文件资源（如果你有富文本里解析出来的附件） */
//  @Builder.Default
//  private List<FileResourceDto> resources = new ArrayList<>();
}
