package io.github.dutianze.yotsuba.file.service;

import io.github.dutianze.yotsuba.file.domain.FileResource;
import io.github.dutianze.yotsuba.file.domain.FileResourceRepository;
import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.file.domain.valueobject.ResourceType;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {

    private static final Logger logger = LoggerFactory.getLogger(FileService.class);
    private static final String FILE_STORAGE_PATH = "files";
    private static final String PASSWORD = "123";
    private final FileResourceRepository fileResourceRepository;
    private final PasswordEncoder passwordEncoder;
    private final AesCtrFileEncryptionService aesCtrFileEncryptionService;

    public FileResource upload(MultipartFile file, String password) throws Exception {
        logger.info("Saving file: {}", file.getName());
        FileResourceId fileResourceId = new FileResourceId();
        try (InputStream in = new BufferedInputStream(file.getInputStream())) {
            aesCtrFileEncryptionService.encryptFile(in, fileResourceId, password);
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
        try {
            boolean deleted = aesCtrFileEncryptionService.deleteFile(id);
            if (deleted) {
                logger.info("File deleted: {}", id.id());
            }
            return deleted;
        } catch (Exception e) {
            logger.error("Failed to delete file: {}", id.id(), e);
            return false;
        }
    }

    public ResponseEntity<StreamingResponseBody> downloadFile(FileResourceId fileResourceId) {
        FileResource res = fileResourceRepository.findById(fileResourceId).orElse(null);
        if (res == null) {
            return ResponseEntity.notFound().build();
        }

        ContentDisposition contentDisposition = this.buildDisposition(res.getContentType(),
                                                                      res.getFilename());

        StreamingResponseBody streamBody = outputStream -> {
            InputStream inputStream = null;
            try {
                switch (res.getResourceType()) {
                    case DATABASE -> {
                        byte[] data = res.getData();
                        if (data == null || data.length == 0) {
                            return;
                        }
                        inputStream = new ByteArrayInputStream(data);
                    }
                    case LOCAL -> inputStream = aesCtrFileEncryptionService.decryptFile(res.getId(), PASSWORD);
                }

                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }
                outputStream.flush();
            } catch (java.io.IOException e) {
                logger.error("Error streaming file: {}", fileResourceId.id(), e);
                throw new java.io.UncheckedIOException("Failed to stream file", e);
            } catch (Exception e) {
                logger.error("Error streaming file: {}", fileResourceId.id(), e);
                throw new RuntimeException("Failed to stream file", e);
            } finally {
                if (inputStream != null) {
                    try {
                        inputStream.close();
                    } catch (java.io.IOException e) {
                        logger.warn("Failed to close input stream", e);
                    }
                }
            }
        };

        return ResponseEntity.ok()
                             .header(HttpHeaders.CONTENT_TYPE, res.getContentType())
                             .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
                             .body(streamBody);
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
