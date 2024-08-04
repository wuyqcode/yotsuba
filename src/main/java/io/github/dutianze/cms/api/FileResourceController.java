package io.github.dutianze.cms.api;

import io.github.dutianze.cms.domain.*;
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

    private final PostRepository postRepository;
    private final FileResourceRepository fileResourceRepository;

    public FileResourceController(PostRepository postRepository, FileResourceRepository fileResourceRepository) {
        this.postRepository = postRepository;
        this.fileResourceRepository = fileResourceRepository;
    }

    @Transactional
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> upload(@RequestParam("postId") PostId postId,
                                         @RequestParam("file") MultipartFile file) throws IOException {

        Post post = postRepository.findById(postId).orElseThrow();

        String filename = Optional.ofNullable(file.getOriginalFilename()).orElse("unnamed");
        String url = post.addFileResource(filename, file.getBytes());
        return ResponseEntity.ok().body(url);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InputStreamResource> download(@PathVariable("id") FileResourceId id) {
        Optional<FileResource> noteImageOptional = fileResourceRepository.findById(id);
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
