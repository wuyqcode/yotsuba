package io.github.dutianze.yotsuba.file.dto;

import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.file.domain.valueobject.ReferenceInfo;
import io.github.dutianze.yotsuba.file.domain.valueobject.ResourceType;
import java.time.LocalDateTime;

public record FileResourceDto(
    FileResourceId id,
    String filename,
    String contentType,
    ResourceType resourceType,
    Long size,
    ReferenceInfo reference,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
