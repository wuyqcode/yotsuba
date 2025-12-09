package io.github.dutianze.yotsuba.file;

import io.github.dutianze.yotsuba.file.domain.FileResource;
import io.github.dutianze.yotsuba.file.domain.FileResourceRepository;
import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.file.service.FileService;
import io.github.dutianze.yotsuba.shared.common.ReferenceCategory;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@Slf4j
@RestController
@RequestMapping("/api/file-resource")
@RequiredArgsConstructor
public class FileResourceController {

  private final FileService fileService;
  private static final String PASSWORD = "123";
  private final FileResourceRepository fileResourceRepository;

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<String> upload(@RequestParam MultipartFile file,
      @RequestParam(required = false) String referenceId,
      @RequestParam(required = false) ReferenceCategory referenceCategory) throws Exception {
    FileResource fileResource = fileService.upload(file, PASSWORD, referenceId, referenceCategory);
    return ResponseEntity.ok().body(fileResource.getId().getUrl());
  }

  @GetMapping("/{id}")
  public ResponseEntity<StreamingResponseBody> download(@PathVariable String id) {
    FileResource res = fileResourceRepository.findById(new FileResourceId(id)).orElse(null);
    if (res == null) {
      return ResponseEntity.notFound().build();
    }

    StreamingResponseBody responseBody = fileService.downloadFile(res, null);

    ContentDisposition contentDisposition = this.buildDisposition(res.getContentType(),
        res.getFilename());

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_TYPE, res.getContentType())
        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000, immutable")
        .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
        .body(responseBody);
  }

  @GetMapping("/{id}/thumbnail/{index}")
  public ResponseEntity<StreamingResponseBody> download(@PathVariable String id,
      @PathVariable String index) {
    FileResource res = fileResourceRepository.findById(new FileResourceId(id)).orElse(null);
    if (res == null) {
      return ResponseEntity.notFound().build();
    }

    StreamingResponseBody responseBody = fileService.downloadFile(res, index);

    String encoded = URLEncoder.encode(res.getFilename() + "_" + index, StandardCharsets.UTF_8);
    ContentDisposition contentDisposition = ContentDisposition.inline().filename(encoded).build();

    String filename = res.getFilename().toLowerCase();
    MediaType contentType;

    if (filename.endsWith(".ppt") || filename.endsWith(".pptx")) {
      // PPT → PNG
      contentType = MediaType.IMAGE_PNG;
    } else if (filename.endsWith(".xls") || filename.endsWith(".xlsx")) {
      // Excel → HTML
      contentType = MediaType.TEXT_HTML;
    } else {
      // 默认：按文本处理
      contentType = MediaType.APPLICATION_OCTET_STREAM;
    }

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_TYPE, contentType.toString())
        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000, immutable")
        .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
        .body(responseBody);
  }

  private ContentDisposition buildDisposition(String contentType, String filename) {
    String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8);
    return !"application/octet-stream".equals(contentType)
        ? ContentDisposition.inline().filename(encoded).build()
        : ContentDisposition.attachment().filename(encoded).build();
  }
}
