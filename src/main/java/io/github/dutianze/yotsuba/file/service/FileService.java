package io.github.dutianze.yotsuba.file.service;

import io.github.dutianze.yotsuba.file.domain.FileResource;
import io.github.dutianze.yotsuba.file.domain.FileResourceRepository;
import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.shared.common.ReferenceCategory;
import io.github.dutianze.yotsuba.file.domain.valueobject.ReferenceInfo;
import io.github.dutianze.yotsuba.file.domain.valueobject.ResourceType;
import io.github.dutianze.yotsuba.file.domain.valueobject.StorageVersion;
import io.github.dutianze.yotsuba.shared.common.FileReferenceId;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private final ThumbnailHandler thumbnailHandler;

    public FileResource upload(MultipartFile file, String password, String referenceId,
                               ReferenceCategory referenceCategory) throws Exception {
        logger.info("Saving file: {}", file.getName());
        FileResourceId fileResourceId = new FileResourceId();
        StorageVersion storageVersion = StorageVersion.V3;
        List<Integer> thumbnailIndexList;
        try (InputStream in = new BufferedInputStream(file.getInputStream())) {
            aesCtrFileEncryptionService.encryptFile(in, Path.of(fileResourceId.id()), password, storageVersion);
            thumbnailIndexList = thumbnailHandler.generateThumbnail(file, fileResourceId.id(), password, storageVersion);
        }

        FileResource fileResource = new FileResource();
        String contentType =
                Optional.ofNullable(file.getContentType()).orElse(MediaType.APPLICATION_OCTET_STREAM_VALUE);
        fileResource.setId(fileResourceId);
        fileResource.setFilename(file.getOriginalFilename());
        fileResource.setResourceType(ResourceType.LOCAL);
        fileResource.setFileSize(file.getSize());
        fileResource.setContentType(contentType);
        fileResource.setThumbnailIndexList(thumbnailIndexList);
        fileResource.setStorageVersion(storageVersion);
        fileResource.setReference(new ReferenceInfo(new FileReferenceId(referenceId), referenceCategory));
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
            Optional<FileResource> fileResource = fileResourceRepository.findById(id);
            StorageVersion storageVersion = fileResource.map(FileResource::getStorageVersion)
                .orElse(StorageVersion.V1);
            boolean deleted = aesCtrFileEncryptionService.deleteFile(id, storageVersion);
            if (deleted) {
                logger.info("File deleted: {}", id.id());
            }
            return deleted;
        } catch (Exception e) {
            logger.error("Failed to delete file: {}", id.id(), e);
            return false;
        }
    }

    public StreamingResponseBody downloadFile(FileResource res, String index) {
        return outputStream -> {
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
                    case LOCAL -> {
                        Path path = (index == null)
                            ? Path.of(res.getId().id())
                            : Path.of(res.getId().id(), index);
                        inputStream = aesCtrFileEncryptionService.decryptFile(path, PASSWORD, res.getStorageVersion());
                    }
                }

                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }
                outputStream.flush();
            } catch (java.io.IOException e) {
                logger.error("Error streaming file: {}", res.getId().id(), e);
                throw new java.io.UncheckedIOException("Failed to stream file", e);
            } catch (Exception e) {
                logger.error("Error streaming file: {}", res.getId().id(), e);
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
