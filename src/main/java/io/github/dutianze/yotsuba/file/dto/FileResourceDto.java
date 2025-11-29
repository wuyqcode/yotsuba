package io.github.dutianze.yotsuba.file.dto;

import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.file.domain.valueobject.ReferenceInfo;
import io.github.dutianze.yotsuba.file.domain.valueobject.ResourceType;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.lang.NonNull;

public record FileResourceDto(
    @NonNull
    FileResourceId id,
    String filename,
    String contentType,
    ResourceType resourceType,
    Long size,
    ReferenceInfo reference,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    @NonNull
    List<Integer> thumbnailIndexList
) {

}
