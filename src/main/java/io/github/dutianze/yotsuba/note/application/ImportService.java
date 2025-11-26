package io.github.dutianze.yotsuba.note.application;

import io.github.dutianze.yotsuba.file.domain.FileResource;
import io.github.dutianze.yotsuba.file.domain.FileResourceRepository;
import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.note.domain.Collection;
import io.github.dutianze.yotsuba.note.domain.Note;
import io.github.dutianze.yotsuba.note.domain.Tag;
import io.github.dutianze.yotsuba.note.domain.repository.CollectionRepository;
import io.github.dutianze.yotsuba.note.domain.repository.NoteRepository;
import io.github.dutianze.yotsuba.note.domain.repository.TagRepository;
import io.github.dutianze.yotsuba.note.domain.valueobject.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

    private final ConcurrentHashMap<String, Tag> TAG_CACHE = new ConcurrentHashMap<>();

    public ImportResult importFromSqlite(Path sqliteFilePath) throws Exception {
        ImportResult result = new ImportResult();

        String jdbcUrl = "jdbc:sqlite:" + sqliteFilePath.toAbsolutePath();

        Collection defaultCollection = collectionRepository.findById(
                new CollectionId("SYSTEM_DEFAULT")
        ).orElseThrow(() -> new IllegalStateException("默认 collection 不存在"));

        try (Connection conn = DriverManager.getConnection(jdbcUrl)) {

            int totalCount = getTotalCount(conn);
            log.info("开始导入 memo，总计 {} 条", totalCount);

            int pageSize = 100;
            int totalPages = (totalCount + pageSize - 1) / pageSize;

            for (int page = 0; page < totalPages; page++) {

                long pageStart = System.currentTimeMillis();
                int offset = page * pageSize;

                List<MemoRow> rows = loadPage(conn, pageSize, offset);
                log.info("读取第 {}/{} 页，共 {} 条", page + 1, totalPages, rows.size());

                for (MemoRow row : rows) {
                    processMemoRow(row, conn, defaultCollection, result);
                }

                long pageTime = System.currentTimeMillis() - pageStart;

                log.info("【进度】第 {}/{} 页完成 | 耗时 {} ms | 导入:{} 跳过:{}",
                         page + 1, totalPages, pageTime,
                         result.imported, result.skipped
                );
            }

            log.info("导入完成！总计:{} | 导入:{} | 跳过:{}", totalCount, result.imported, result.skipped);
        }

        return result;
    }

    // 获取总数
    private int getTotalCount(Connection conn) throws Exception {
        try (PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM memo");
             ResultSet rs = ps.executeQuery()) {
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    // 分页读取
    private List<MemoRow> loadPage(Connection conn, int limit, int offset) throws Exception {
        List<MemoRow> rows = new ArrayList<>();

        try (PreparedStatement ps = conn.prepareStatement(
                "SELECT id, created_at, updated_at, content, title, background " +
                "FROM memo LIMIT ? OFFSET ?"
        )) {
            ps.setInt(1, limit);
            ps.setInt(2, offset);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    rows.add(new MemoRow(
                            rs.getString("id"),
                            rs.getString("title"),
                            rs.getString("content"),
                            rs.getString("background"),
                            rs.getLong("created_at"),
                            rs.getLong("updated_at")
                    ));
                }
            }
        }

        return rows;
    }

    // 处理单条 memo
    private void processMemoRow(MemoRow row, Connection conn, Collection defaultCollection,
                                ImportResult result) {
        try {
            NoteId noteId = new NoteId(row.id());

            String content = row.content();
            content = replaceImageUrls(content);
            FileResourceId coverId = getFirstImageUrl(content);


            Note note = Note.createWithIdAndContent(
                    noteId,
                    defaultCollection,
                    new NoteTitle(row.title()),
                    new NoteContent(content),
                    NoteType.WIKI,
                    coverId,          // ★ 使用 coverId
                    row.createdAt(),
                    row.updatedAt()
            );


            // 加载 Tags
            Set<Tag> tags = loadTagsForMemo(conn, row.id(), defaultCollection);
            note.getTags().addAll(tags);

            // 保存
            noteRepository.save(note);
            result.imported++;

            // ★★★ 每条记录保存都打印 ★★★
            log.info("[保存成功] memo={} title=\"{}\"", row.id(), row.title());

        } catch (Exception e) {
            log.error("[失败] memo {} 错误 {}", row.id(), e.getMessage(), e);
        }
    }

    // 加载 tag
    private Set<Tag> loadTagsForMemo(Connection conn, String memoId, Collection collection)
            throws Exception {

        Set<Tag> tags = new HashSet<>();

        try (PreparedStatement ps = conn.prepareStatement(
                "SELECT tag_id FROM memo_tag WHERE memo_id = ?"
        )) {
            ps.setString(1, memoId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    String tagId = rs.getString("tag_id");
                    String tagName = getTagName(conn, tagId);
                    if (tagName.isEmpty()) tagName = tagId;

                    Tag tag = TAG_CACHE.computeIfAbsent(tagName,
                                                        name -> findOrCreateTag(tagId, name, collection)
                    );

                    tags.add(tag);
                }
            }
        }

        return tags;
    }

    private String getTagName(Connection conn, String tagId) throws Exception {
        try (PreparedStatement ps = conn.prepareStatement("SELECT name FROM tag WHERE id = ?")) {
            ps.setString(1, tagId);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getString("name") : "";
            }
        }
    }

    private Tag findOrCreateTag(String tagId, String name, Collection collection) {
        return tagRepository.findByIdAndCollectionId(new TagId(tagId), collection.getId())
                            .orElseGet(() -> tagRepository.save(Tag.create(new TagId(tagId), name, collection)));
    }

    private FileResourceId getFirstImageUrl(String content) {
        if (content == null || content.isEmpty()) {
            return null;
        }

        // 用 Jsoup 解析内容
        Document doc = Jsoup.parse("<body>" + content + "</body>");
        Element body = doc.body();

        // 找第一个 <img>
        Element img = body.selectFirst("img");
        if (img == null) {
            return null;
        }

        // 拿到 src 属性
        String src = img.attr("src");
        String s = (src == null || src.isEmpty()) ? null : src;
        return FileResourceId.extractIdFromUrl(s);
    }



    private String replaceImageUrls(String content) {
        if (content == null || content.isEmpty()) return content;

        // 固定：整个字符串解析成一个独立 Document
        Document doc = Jsoup.parse("<body>" + content + "</body>");
        Element body = doc.body(); // 永远不为 null

        List<Element> imgs = body.select("img");

        for (Element img : imgs) {

            String src = img.attr("src");
            if (src == null || src.isEmpty()) continue;

            Matcher m = IMAGE_URL_PATTERN.matcher(src);
            if (!m.find()) continue;

            String imageId = m.group(1);
            String newUrl = new FileResourceId(imageId).getUrl();

            // 新 HTML 结构
            String newHtml =
                    "<p><span style=\"text-align: center;\" class=\"image\">" +
                    "<img height=\"auto\" style=\"\" src=\"" + newUrl + "\"" +
                    " flipx=\"false\" flipy=\"false\" align=\"middle\" inline=\"true\">" +
                    "</span></p>";

            // 统一：在 body 中替换（最安全）
            // 1. 将 <img> 替换为 <temp> 占位
            img.after("<temp></temp>");
            img.remove();

            // 2. 找到我们插入的占位符并替换其内容
            Element temp = body.selectFirst("temp");
            if (temp != null) {
                temp.replaceWith(Jsoup.parse(newHtml).body().child(0).clone());
            }
        }

        return body.html();
    }


    // Data class
    record MemoRow(String id, String title, String content,
                   String background, long createdAt, long updatedAt) {}

    /**
     * 仅导入 image 表到 FileResource
     */
    @Transactional
    public ImportResult importImagesToFileResource(Path sqliteFilePath) throws Exception {
        ImportResult result = new ImportResult();

        String jdbcUrl = "jdbc:sqlite:" + sqliteFilePath.toAbsolutePath();

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
                            // 统一使用 PNG 格式，不检测图片类型
                            String contentType = MediaType.IMAGE_PNG_VALUE;
                            String filename = "image_" + imageId + ".png";
                            // 创建 FileResource
                            FileResource fileResource = new FileResource(new FileResourceId(imageId), filename, contentType, imageData);
                            fileResourceRepository.save(fileResource);
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
            }
            log.info("导入完成，总计: {} 个，已导入: {} 个，跳过: {} 个", totalCount, result.imported,
                     result.skipped);
        }

        return result;
    }

    public static class ImportResult {

        public int imported = 0;
        public int skipped = 0;

    }
}

