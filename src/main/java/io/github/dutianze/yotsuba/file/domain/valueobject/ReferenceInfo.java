package io.github.dutianze.yotsuba.file.domain.valueobject;

import io.github.dutianze.yotsuba.shared.common.FileReferenceId;
import io.github.dutianze.yotsuba.shared.common.ReferenceCategory;
import io.github.dutianze.yotsuba.shared.common.ReferenceTypeDeprecated;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Embeddable
public record ReferenceInfo(

        FileReferenceId referenceId,

        @Deprecated
        ReferenceTypeDeprecated referenceTypeDeprecated,

        @Enumerated(EnumType.STRING)
        ReferenceCategory referenceCategory

) {

    public ReferenceInfo {
        referenceTypeDeprecated = ReferenceTypeDeprecated.NOTE_COVER;
    }

    public ReferenceInfo(FileReferenceId referenceId,
                         ReferenceCategory referenceCategory) {
        this(referenceId, null, referenceCategory);
    }

}

