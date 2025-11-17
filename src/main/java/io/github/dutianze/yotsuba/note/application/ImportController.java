package io.github.dutianze.yotsuba.note.application;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 处理 memo.db SQLite 文件导入的控制器
 *
 * @author dutianze
 */
@Slf4j
@RestController
@RequestMapping("/api/import")
@RequiredArgsConstructor
public class ImportController {

  private final ImportService importService;

  @PostMapping("/file")
  public ResponseEntity<ImportService.ImportResult> importImagesToFile(
      @RequestParam("path") String filePath) {
    try {
      Path path = validateFilePath(filePath);
      if (path == null) {
        return ResponseEntity.badRequest().build();
      }

      // 执行导入到 FileResource
      ImportService.ImportResult result = importService.importImagesToFileResource(path);

      return ResponseEntity.ok(result);
    } catch (Exception e) {
      log.error("导入失败: ", e);
      return ResponseEntity.internalServerError().build();
    }
  }

  @PostMapping("/memo")
  public ResponseEntity<ImportService.ImportResult> importMemoDb(
      @RequestParam("path") String filePath) {
    try {
      Path path = validateFilePath(filePath);
      if (path == null) {
        return ResponseEntity.badRequest().build();
      }

      // 执行导入到 Yotsuba
      ImportService.ImportResult result = importService.importFromSqlite(path);

      return ResponseEntity.ok(result);
    } catch (Exception e) {
      log.error("导入失败: ", e);
      return ResponseEntity.internalServerError().build();
    }
  }

  private Path validateFilePath(String filePath) {
    Path path = Paths.get(filePath);

    // 验证文件是否存在
    if (!Files.exists(path)) {
      log.warn("文件不存在: {}", filePath);
      return null;
    }

    // 验证是否为文件（而非目录）
    if (!Files.isRegularFile(path)) {
      log.warn("路径不是文件: {}", filePath);
      return null;
    }

    // 验证文件类型
    if (!path.toString().endsWith(".db")) {
      log.warn("文件类型不正确: {}", filePath);
      return null;
    }

    return path;
  }
}

