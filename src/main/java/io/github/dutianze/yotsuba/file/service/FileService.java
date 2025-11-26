package io.github.dutianze.yotsuba.file.service;

import io.github.dutianze.yotsuba.file.domain.FileResource;
import io.github.dutianze.yotsuba.file.domain.FileResourceRepository;
import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.file.domain.valueobject.ResourceType;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {

  private static final Logger logger = LoggerFactory.getLogger(FileService.class);
  private static final String FILE_STORAGE_PATH = "files";
  private static final String PASSWORD = "123";
  private final FileResourceRepository fileResourceRepository;
  private final PasswordEncoder passwordEncoder;
  private final FileEncryptionService fileEncryptionService;

  public FileResource upload(MultipartFile file, String password) throws Exception {
    logger.info("Saving file: {}", file.getName());
    FileResourceId fileResourceId = new FileResourceId();
    File localFile = Paths.get(FILE_STORAGE_PATH, fileResourceId.id()).toFile();
    try (OutputStream out = fileEncryptionService.getEncryptedOutputStream(localFile, password)) {
      try (InputStream in = new BufferedInputStream(file.getInputStream())) {
        in.transferTo(out);
      }
    }

    FileResource fileResource = new FileResource();
    String contentType =
        Optional.ofNullable(file.getContentType()).orElse(MediaType.APPLICATION_OCTET_STREAM_VALUE);
    fileResource.setId(fileResourceId);
    fileResource.setFilename(file.getOriginalFilename());
    fileResource.setResourceType(ResourceType.LOCAL);
    fileResource.setFileSize(file.getSize());
    fileResource.setContentType(contentType);
    if (StringUtils.isNotBlank(password)) {
      fileResource.setEncrypted(true);
      fileResource.setPasswordHash(passwordEncoder.encode(password));
    }
    return fileResourceRepository.save(fileResource);
  }

  @Transactional
  public boolean deleteFileFromDatabaseAndFileSystem(FileResourceId id) {
    Optional<FileResource> referenceById = fileResourceRepository.findById(id);
    if (referenceById.isEmpty()) {
      return false;
    }

    FileResource localFileResource = referenceById.get();
    fileResourceRepository.delete(localFileResource);
    return deleteFileFromFileSystem(localFileResource.getId());
  }

  @PostConstruct
  public void createFileSavePath() {
    try {
      Files.createDirectories(Path.of(FILE_STORAGE_PATH));
      logger.info("File save path created: {}", FILE_STORAGE_PATH);
    } catch (
        Exception e) {
      logger.error("Failed to create file save path: {}", FILE_STORAGE_PATH);
    }
  }

  private boolean deleteFileFromFileSystem(FileResourceId id) {
    Path path = Path.of(FILE_STORAGE_PATH, id.id());
    try {
      Files.delete(path);
      logger.info("File deleted: {}", path);
    } catch (Exception e) {
      return false;
    }
    return true;
  }

  public ResponseEntity<ResourceRegion> downloadFile(
      FileResourceId fileResourceId, HttpHeaders headers) throws Exception {
    FileResource res = fileResourceRepository.findById(fileResourceId).orElse(null);
    if (res == null) {
      return ResponseEntity.notFound().build();
    }

    ResourceRegion region = null;
    HttpStatus status = HttpStatus.OK;
    switch (res.getResourceType()) {
      case DATABASE -> {
        byte[] data = res.getData();
        if (data == null || data.length == 0) {
          return ResponseEntity.notFound().build();
        }
        ByteArrayResource resource = new ByteArrayResource(data);
        region = new ResourceRegion(resource, 0, data.length);
      }
      case LOCAL -> {
        File file = Path.of(FILE_STORAGE_PATH, res.getId().id()).toFile();
        if (!file.exists()) {
          return ResponseEntity.notFound().build();
        }

        Optional<HttpRange> rangeOptional = headers.getRange().stream().findFirst();
        long fileSize = fileEncryptionService.getPlaintextSize(file);

        final long CHUNK_SIZE = 1024;
        if (rangeOptional.isPresent()) {
          HttpRange httpRange = rangeOptional.get();
          long rangeStart = httpRange.getRangeStart(fileSize);
          long rangeEnd   = httpRange.getRangeEnd(fileSize);
          if (rangeStart < 0) {
            rangeStart = 0;
          }
          if (rangeEnd >= fileSize) {
            rangeEnd = fileSize - 1;
          }
          long available = rangeEnd - rangeStart + 1;
          // === 实际本次返回多少字节 ===
          long rangeLength = Math.min(CHUNK_SIZE, available);
          // === 解密区间 ===
          InputStream inputStream =
              fileEncryptionService.openDecryptedRangeStream(
                  file, PASSWORD, rangeStart, rangeStart + rangeLength - 1);

          ReusableResource resource = new ReusableResource(inputStream);
          // ResourceRegion 的 position 必须是 chunk 内相对偏移
          region = new ResourceRegion(resource, 0, rangeLength);

          long nextStart = rangeStart + rangeLength;
          boolean isLastChunk = nextStart > fileSize - 1;
          status = isLastChunk ? HttpStatus.OK : HttpStatus.PARTIAL_CONTENT;
        } else {
          // === 无 Range：返回首块 ===
          long rangeLength = Math.min(CHUNK_SIZE, fileSize);
          InputStream inputStream =
              fileEncryptionService.openDecryptedRangeStream(file, PASSWORD, 0, rangeLength);
          ReusableResource resource = new ReusableResource(inputStream);
          region = new ResourceRegion(resource, 0, rangeLength);
          boolean isLastChunk = (rangeLength == fileSize);
          status = isLastChunk ? HttpStatus.OK : HttpStatus.PARTIAL_CONTENT;
        }
      }
    }

    ContentDisposition contentDisposition = this.buildDisposition(res.getContentType(),
        res.getFilename());

    return ResponseEntity.status(status)
        .contentType(
            MediaTypeFactory.getMediaType(res.getContentType())
                .orElse(MediaType.APPLICATION_OCTET_STREAM))
        .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
        .body(region);
  }

  private ContentDisposition buildDisposition(String contentType, String filename) {
    String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8);
    return !"application/octet-stream".equals(contentType)
        ? ContentDisposition.inline().filename(encoded).build()
        : ContentDisposition.attachment().filename(encoded).build();
  }

  public boolean checkFilePassword(FileResourceId id, String password) {
    Optional<FileResource> referenceById = fileResourceRepository.findById(id);
    if (referenceById.isEmpty()) {
      return false;
    }

    FileResource fileEntity = referenceById.get();
    return passwordEncoder.matches(password, fileEntity.getPasswordHash());
  }
}
