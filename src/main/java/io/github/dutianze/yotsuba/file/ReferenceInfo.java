package io.github.dutianze.yotsuba.file;

import io.github.dutianze.yotsuba.shared.common.FileReferenceId;
import io.github.dutianze.yotsuba.shared.common.ReferenceType;
import jakarta.persistence.Embeddable;

/**
 * @author dutianze
 * @date 2024/9/16
 */
@Embeddable
public record ReferenceInfo(FileReferenceId referenceId, ReferenceType referenceType) {
}
