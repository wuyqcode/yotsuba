package io.github.dutianze.yotsuba.file.service;

import io.github.dutianze.yotsuba.file.domain.valueobject.StorageVersion;
import java.io.InputStream;
import java.util.List;

public interface ThumbnailService {
  boolean supports(String filename);
  List<Integer> generateThumbnail(InputStream in, String id, String password, StorageVersion storageVersion) throws Exception;
}
