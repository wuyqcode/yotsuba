package io.github.dutianze.yotsuba.cms.domain;

import io.github.dutianze.yotsuba.file.FileResourceId;
import org.jmolecules.ddd.annotation.Service;

import java.util.Set;

/**
 * @author dutianze
 * @date 2024/9/17
 */
@Service
public interface MarkdownExtractService {

    Set<FileResourceId> extractFileReferenceIds(String markdown);
}