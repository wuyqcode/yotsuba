package io.github.dutianze.yotsuba.file;

import io.github.dutianze.yotsuba.shared.common.FileReferenceId;
import io.github.dutianze.yotsuba.shared.common.ReferenceType;
import org.jmolecules.ddd.types.ValueObject;

/**
 * @author dutianze
 * @date 2024/9/16
 */
public record ReferenceInfo(FileReferenceId referenceId, ReferenceType referenceType) implements ValueObject {
}
