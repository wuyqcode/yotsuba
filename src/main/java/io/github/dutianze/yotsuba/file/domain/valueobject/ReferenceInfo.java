package io.github.dutianze.yotsuba.file.domain.valueobject;

import io.github.dutianze.yotsuba.shared.common.FileReferenceId;
import io.github.dutianze.yotsuba.shared.common.ReferenceType;
import jakarta.persistence.Embeddable;

@Embeddable
public record ReferenceInfo(FileReferenceId referenceId, ReferenceType referenceType) {

}
