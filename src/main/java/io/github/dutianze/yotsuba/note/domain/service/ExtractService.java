package io.github.dutianze.yotsuba.note.domain.service;

import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;

import java.util.LinkedHashSet;

public interface ExtractService {

  LinkedHashSet<FileResourceId> extractFileReferenceIds(String content);
}
