package io.github.dutianze.yotsuba.note.application;

import io.github.dutianze.yotsuba.file.FileResource;
import io.github.dutianze.yotsuba.file.FileResourceId;
import io.github.dutianze.yotsuba.file.FileResourceRepository;
import io.github.dutianze.yotsuba.note.domain.Collection;
import io.github.dutianze.yotsuba.note.domain.CollectionRepository;
import io.github.dutianze.yotsuba.note.domain.Note;
import io.github.dutianze.yotsuba.note.domain.NoteRepository;
import io.github.dutianze.yotsuba.note.domain.Tag;
import io.github.dutianze.yotsuba.note.domain.TagRepository;
import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionId;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteContent;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteId;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteTitle;
import io.github.dutianze.yotsuba.note.domain.valueobject.NoteType;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 处理 memo.db SQLite 文件导入和迁移服务
 *
 * @author dutianze
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ImportService {

  private static final Pattern IMAGE_URL_PATTERN = Pattern.compile("/api/image/([A-Z0-9]+)");

  private final NoteRepository noteRepository;
  private final TagRepository tagRepository;
  private final CollectionRepository collectionRepository;
  private final FileResourceRepository fileResourceRepository;

  @Transactional
  public ImportResult importFromSqlite(Path sqliteFilePath) throws Exception {
    ImportResult result = new ImportResult();

    // 创建临时连接字符串
    String jdbcUrl = "jdbc:sqlite:" + sqliteFilePath.toAbsolutePath().toString();

    // 获取默认 collection
    Collection defaultCollection = collectionRepository.findById(
        new CollectionId("SYSTEM_DEFAULT"))
        .orElseThrow(() -> new IllegalStateException("默认 collection 不存在"));

    try (Connection conn = DriverManager.getConnection(jdbcUrl)) {
      // 先获取总数用于显示进度
      int totalCount = 0;
      try (PreparedStatement countStmt = conn.prepareStatement("SELECT COUNT(*) FROM memo")) {
        try (ResultSet countRs = countStmt.executeQuery()) {
          if (countRs.next()) {
            totalCount = countRs.getInt(1);
          }
        }
      }
      log.info("开始导入 memo，总计: {} 条", totalCount);

      // 读取 memo 表并导入
      int processedCount = 0;
      try (PreparedStatement stmt = conn.prepareStatement(
          "SELECT id, created_at, updated_at, content, title, background, channel_id, rate, spoiler FROM memo")) {
        try (ResultSet rs = stmt.executeQuery()) {
          while (rs.next()) {
            processedCount++;
            String memoId = rs.getString("id");
            String title = rs.getString("title");
            String content = rs.getString("content");
            String background = rs.getString("background");
            Long createdAt = rs.getLong("created_at");
            Long updatedAt = rs.getLong("updated_at");

            // 检查是否已存在
            NoteId noteId = new NoteId(memoId);
            if (noteRepository.existsById(noteId)) {
              result.skipped++;
              continue;
            }

            // 处理 content：替换 /api/image/{imageId} 为 /api/file-resource/{imageId}
            String processedContent = content != null ? content : "";
            processedContent = replaceImageUrls(processedContent);

            // 处理 background：解析逗号分隔的 ID 列表
            FileResourceId coverId = null;
            List<String> backgroundImages = new ArrayList<>();
            if (background != null && !background.trim().isEmpty()) {
              String[] backgroundIds = background.split(",");
              for (int i = 0; i < backgroundIds.length; i++) {
                String bgId = backgroundIds[i].trim();
                if (!bgId.isEmpty()) {
                  // 查找对应的 FileResource（通过文件名查找）
                  FileResourceId fileResourceId = findFileResourceByImageId(bgId);
                  if (fileResourceId != null) {
                    if (i == 0) {
                      // 第一个作为 cover
                      coverId = fileResourceId;
                    }
                    // 所有 background 图片追加到 content
                    String imageUrl = fileResourceId.getUrl();
                    backgroundImages.add("<img src=\"" + imageUrl + "\">");
                  }
                }
              }
            }

            // 将 background 图片追加到 content
            if (!backgroundImages.isEmpty()) {
              if (processedContent.isEmpty()) {
                processedContent = String.join("", backgroundImages);
              } else {
                processedContent = processedContent + String.join("", backgroundImages);
              }
            }

            // 创建 Note（使用导入的 ID 和内容）
            NoteTitle noteTitle = new NoteTitle(title != null && !title.isEmpty() ? title : "无标题");
            NoteContent noteContent = new NoteContent(processedContent);
            Note note = Note.createWithIdAndContent(noteId, defaultCollection, noteTitle, noteContent,
                NoteType.WIKI);

            // 设置封面
            if (coverId != null) {
              try {
                java.lang.reflect.Field coverField = Note.class.getDeclaredField("cover");
                coverField.setAccessible(true);
                coverField.set(note, coverId);
              } catch (Exception e) {
                log.warn("无法设置 cover: {}", e.getMessage());
              }
            }

            // 设置创建和更新时间
            // SQLite timestamp 可能是秒级（10位）或毫秒级（13位）
            if (createdAt != null && createdAt > 0) {
              long timestampMs = createdAt < 10000000000L ? createdAt * 1000 : createdAt;
              LocalDateTime createdAtLocal = LocalDateTime.ofInstant(
                  Instant.ofEpochMilli(timestampMs), ZoneId.systemDefault());
              try {
                java.lang.reflect.Field createdAtField = Note.class.getDeclaredField("createdAt");
                createdAtField.setAccessible(true);
                createdAtField.set(note, createdAtLocal);
              } catch (Exception e) {
                log.warn("无法设置 createdAt: {}", e.getMessage());
              }
            }

            if (updatedAt != null && updatedAt > 0) {
              long timestampMs = updatedAt < 10000000000L ? updatedAt * 1000 : updatedAt;
              LocalDateTime updatedAtLocal = LocalDateTime.ofInstant(
                  Instant.ofEpochMilli(timestampMs), ZoneId.systemDefault());
              try {
                java.lang.reflect.Field updatedAtField = Note.class.getDeclaredField("updatedAt");
                updatedAtField.setAccessible(true);
                updatedAtField.set(note, updatedAtLocal);
              } catch (Exception e) {
                log.warn("无法设置 updatedAt: {}", e.getMessage());
              }
            }

            // 3. 查询 memo_tag 和 tag，设置 tags
            Set<Tag> tags = loadTagsForMemo(conn, memoId, defaultCollection);
            for (Tag tag : tags) {
              note.getTags().add(tag);
            }

            noteRepository.save(note);
            result.imported++;

            // 每处理 10 条打印一次进度
            if (processedCount % 10 == 0 || processedCount == totalCount) {
              log.info("进度: {}/{} ({}%), 已导入: {}, 跳过: {}", processedCount, totalCount,
                  totalCount > 0 ? (processedCount * 100 / totalCount) : 0, result.imported,
                  result.skipped);
            }
          }
        }
      }
      log.info("导入完成，总计: {} 条，已导入: {} 条，跳过: {} 条", totalCount, result.imported,
          result.skipped);
    }

    return result;
  }

  /**
   * 替换 content 中的 /api/image/{imageId} 为 /api/file-resource/{imageId}
   */
  private String replaceImageUrls(String content) {
    if (content == null || content.isEmpty()) {
      return content;
    }

    Matcher matcher = IMAGE_URL_PATTERN.matcher(content);
    StringBuffer result = new StringBuffer();

    while (matcher.find()) {
      String imageId = matcher.group(1);
      // 查找对应的 FileResource
      FileResourceId fileResourceId = findFileResourceByImageId(imageId);

      if (fileResourceId != null) {
        String newUrl = fileResourceId.getUrl();
        matcher.appendReplacement(result, Matcher.quoteReplacement(newUrl));
      } else {
        // 如果找不到对应的 FileResource，保留原 URL
        matcher.appendReplacement(result, matcher.group(0));
      }
    }
    matcher.appendTail(result);

    return result.toString();
  }

  /**
   * 通过 imageId 查找对应的 FileResource
   * FileResource 的文件名格式为：image_{imageId}.png
   */
  private FileResourceId findFileResourceByImageId(String imageId) {
    String expectedFilename = "image_" + imageId + ".png";
    return fileResourceRepository.findAll().stream()
        .filter(fr -> fr.getFilename() != null && fr.getFilename().equals(expectedFilename))
        .map(FileResource::getId)
        .findFirst()
        .orElse(null);
  }

  /**
   * 为 memo 加载 tags
   */
  private Set<Tag> loadTagsForMemo(Connection conn, String memoId, Collection collection)
      throws Exception {
    Set<Tag> tags = new HashSet<>();

    try (PreparedStatement stmt = conn.prepareStatement(
        "SELECT tag_id FROM memo_tag WHERE memo_id = ?")) {
      stmt.setString(1, memoId);
      try (ResultSet rs = stmt.executeQuery()) {
        while (rs.next()) {
          String tagId = rs.getString("tag_id");
          String tagName = getTagName(conn, tagId);

          if (tagName == null || tagName.isEmpty()) {
            tagName = tagId; // 如果没有 tag 表，使用 tag_id 作为名称
          }

          if (tagName != null && !tagName.isEmpty()) {
            Tag tag = findOrCreateTag(tagName, collection);
            tags.add(tag);
          }
        }
      }
    }

    return tags;
  }

  /**
   * 从 tag 表获取 tag 名称
   */
  private String getTagName(Connection conn, String tagId) throws Exception {
    try {
      try (PreparedStatement stmt = conn.prepareStatement(
          "SELECT name FROM tag WHERE id = ?")) {
        stmt.setString(1, tagId);
        try (ResultSet rs = stmt.executeQuery()) {
          if (rs.next()) {
            return rs.getString("name");
          }
        }
      }
    } catch (Exception e) {
      // tag 表可能不存在，返回 null 让调用者使用 tagId 作为名称
      log.debug("无法查询 tag 表: {}", e.getMessage());
    }
    return null;
  }

  /**
   * 查找或创建 Tag
   */
  private Tag findOrCreateTag(String tagName, Collection collection) {
    return tagRepository.findAll().stream()
        .filter(tag -> tag.getName().equals(tagName) && tag.getCollection().getId()
            .equals(collection.getId()))
        .findFirst()
        .orElseGet(() -> {
          Tag newTag = Tag.create(tagName);
          newTag.setCollection(collection);
          return tagRepository.save(newTag);
        });
  }

  /**
   * 仅导入 image 表到 FileResource
   */
  @Transactional
  public ImportResult importImagesToFileResource(Path sqliteFilePath) throws Exception {
    ImportResult result = new ImportResult();

    String jdbcUrl = "jdbc:sqlite:" + sqliteFilePath.toAbsolutePath().toString();

    try (Connection conn = DriverManager.getConnection(jdbcUrl)) {
      // 先获取总数用于显示进度
      int totalCount = 0;
      try (PreparedStatement countStmt = conn
          .prepareStatement("SELECT COUNT(*) FROM image WHERE image_data IS NOT NULL")) {
        try (ResultSet countRs = countStmt.executeQuery()) {
          if (countRs.next()) {
            totalCount = countRs.getInt(1);
          }
        }
      }
      log.info("开始导入 image 到 FileResource，总计: {} 个", totalCount);

      int processedCount = 0;
      try (PreparedStatement stmt = conn.prepareStatement(
          "SELECT id, image_data FROM image WHERE image_data IS NOT NULL")) {
        try (ResultSet rs = stmt.executeQuery()) {
          while (rs.next()) {
            processedCount++;
            String imageId = rs.getString("id");
            byte[] imageData = rs.getBytes("image_data");

            if (imageData != null && imageData.length > 0) {
              boolean exists = fileResourceRepository.findAll().stream()
                  .anyMatch(fr -> fr.getFilename() != null && fr.getFilename().equals(imageId));

              if (exists) {
                result.skipped++;
              } else {
                // 统一使用 PNG 格式，不检测图片类型
                String contentType = MediaType.IMAGE_PNG_VALUE;
                String filename = "image_" + imageId + ".png";

                // 创建 FileResource
                FileResource fileResource = new FileResource(null, filename, contentType, imageData);
                fileResourceRepository.save(fileResource);

                result.imported++;
              }

              // 每处理 10 条打印一次进度
              if (processedCount % 10 == 0 || processedCount == totalCount) {
                log.info("进度: {}/{} ({}%), 已导入: {}, 跳过: {}", processedCount, totalCount,
                    totalCount > 0 ? (processedCount * 100 / totalCount) : 0, result.imported,
                    result.skipped);
              }
            }
          }
        }
      }
      log.info("导入完成，总计: {} 个，已导入: {} 个，跳过: {} 个", totalCount, result.imported,
          result.skipped);
    }

    return result;
  }

  public static class ImportResult {

    public int imported = 0;
    public int skipped = 0;

    public int getTotal() {
      return imported + skipped;
    }
  }
}

