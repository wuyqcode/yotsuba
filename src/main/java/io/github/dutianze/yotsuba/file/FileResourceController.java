package io.github.dutianze.yotsuba.file;

import io.github.dutianze.yotsuba.file.domain.FileResource;
import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.file.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<String> upload(@RequestParam MultipartFile file) throws Exception {
    FileResource fileResource = fileService.upload(file, PASSWORD);
    return ResponseEntity.ok().body(fileResource.getId().getUrl());
  }

  @GetMapping("/{id}")
  public ResponseEntity<StreamingResponseBody> download(@PathVariable String id) throws Exception {
    FileResourceId fileResourceId = new FileResourceId(id);
    return fileService.downloadFile(fileResourceId);
  }
}
