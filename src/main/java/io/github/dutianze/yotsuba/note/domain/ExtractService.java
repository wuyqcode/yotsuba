package io.github.dutianze.yotsuba.note.domain;

import io.github.dutianze.yotsuba.file.FileResourceId;
import java.util.LinkedHashSet;

public interface ExtractService {

  LinkedHashSet<FileResourceId> extractFileReferenceIds(String content);
}
