package io.github.dutianze.yotsuba.file.service;

import io.github.dutianze.yotsuba.file.domain.valueobject.StorageVersion;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ThumbnailHandler {

  private final List<ThumbnailService> services;

  public List<Integer> generateThumbnail(MultipartFile file, String id, String password, StorageVersion storageVersion)
      throws Exception {

    ThumbnailService service = services.stream()
        .filter(s -> s.supports(file.getOriginalFilename()))
        .findFirst()
        .orElse(null);

    if (service == null) {
      return List.of();
    }

    return service.generateThumbnail(file.getInputStream(), id, password, storageVersion);
  }
}

