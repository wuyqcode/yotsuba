package io.github.dutianze.api.rest;

import io.github.dutianze.domain.pipeline.*;
import io.github.dutianze.domain.policy.PolicyManager;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author dutianze
 * @date 2024/7/2
 */
@RestController
@RequestMapping("/api")
public class EpubController {

    private static final ConcurrentHashMap<String, String> cache = new ConcurrentHashMap<>();
    private final PolicyManager policyManager;

    public EpubController(PolicyManager policyManager) {
        this.policyManager = policyManager;
    }

    @PostMapping(value = "/uploadEpub", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = "application/json")
    public ResponseEntity<Resource> uploadEpub(@RequestParam("file") MultipartFile file) {
        // build pipeline
        Pipeline<MultipartFile, ByteArrayOutputStream> pipeline = new Pipeline<>(new EpubReadingHandler())
                .addHandler(new LoadEnglishHandler())
                .addHandler(new ParagraphProcessHandler(policyManager))
                .addHandler(new EpubWriteHandler());
        // execute pipeline
        ByteArrayOutputStream outputStream = pipeline.execute(file);
        // generate filename
        String fileName = Optional.ofNullable(file.getOriginalFilename())
                                  .map(name -> URLEncoder.encode(name, StandardCharsets.UTF_8))
                                  .orElseGet(() -> UUID.randomUUID() + ".epub");
        // create resource
        ByteArrayResource resource = new ByteArrayResource(outputStream.toByteArray());
        // create header
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName);
        headers.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
        // return response
        return ResponseEntity.ok().headers(headers).body(resource);
    }
}
