package io.github.dutianze.yotsuba.cms.application.dto;

import io.github.dutianze.yotsuba.file.FileResource;

/**
 * @author dutianze
 * @date 2024/8/21
 */
public record FileResourceDto(
        String id,
        String filename,
        String url
) {

    public static FileResourceDto fromEntity(FileResource fileResource) {
        return new FileResourceDto(fileResource.getId().id(), fileResource.getFilename(),
                                   fileResource.getId().getURL());
    }
}
