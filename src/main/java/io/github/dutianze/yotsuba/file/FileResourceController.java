package io.github.dutianze.yotsuba.file;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
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

    @Transactional
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> upload(@RequestParam MultipartFile file) throws IOException {

        String filename = Optional.ofNullable(file.getOriginalFilename()).orElse("unnamed");
        FileResource fileResource = new FileResource(null, filename, file.getBytes());

        fileResourceRepository.save(fileResource);
        return ResponseEntity.ok().body(fileResource.getId().getURL());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InputStreamResource> download(@PathVariable("id") FileResourceId resourceId) {
        Optional<FileResource> noteImageOptional = fileResourceRepository.findById(resourceId);
        return noteImageOptional
                .map(FileResource::getData)
                .map(ByteArrayInputStream::new)
                .map(InputStreamResource::new)
                .map(streamResource -> ResponseEntity.ok()
                                                     .contentType(MediaType.IMAGE_PNG)
                                                     .body(streamResource))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

}
