package io.github.dutianze.yotsuba.cms.domain;

import io.github.dutianze.yotsuba.file.FileResourceId;

import java.util.Set;

/**
 * @author dutianze
 * @date 2024/9/17
 */
public interface MarkdownExtractService {

    Set<FileResourceId> extractFileReferenceIds(String markdown);
}