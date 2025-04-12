package io.github.dutianze.yotsuba.file;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Optional;

/**
 * @author dutianze
 * @date 2024/8/3
 */
@RestController
@RequestMapping("/api/file-resource")
public class FileResourceController {

    private final FileResourceRepository fileResourceRepository;

    public FileResourceController(FileResourceRepository fileResourceRepository) {
        this.fileResourceRepository = fileResourceRepository;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> upload(@RequestParam MultipartFile file) throws IOException {

        String filename = Optional.ofNullable(file.getOriginalFilename()).orElse("unnamed");
        String contentType =
                Optional.ofNullable(file.getContentType()).orElse(MediaType.APPLICATION_OCTET_STREAM_VALUE);

        FileResource fileResource = new FileResource(null, filename, contentType, file.getBytes());

        fileResourceRepository.save(fileResource);
        return ResponseEntity.ok().body(fileResource.getId().getURL());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InputStreamResource> download(@PathVariable("id") FileResourceId resourceId) {
        Optional<FileResource> noteImageOptional = fileResourceRepository.findById(resourceId);
        return noteImageOptional
                .map(fileResource -> {
                    InputStreamResource resource =
                            new InputStreamResource(new ByteArrayInputStream(fileResource.getData()));
                    return ResponseEntity
                            .ok()
                            .contentType(MediaType.parseMediaType(fileResource.getContentType()))
                            .header(HttpHeaders.CONTENT_DISPOSITION,
                                    ContentDisposition.attachment().filename(fileResource.getFilename()).build()
                                                      .toString())
                            .body(resource);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

}
