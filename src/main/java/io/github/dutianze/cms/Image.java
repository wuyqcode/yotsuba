package io.github.dutianze.cms;

import org.apache.commons.lang3.StringUtils;
import org.jmolecules.ddd.types.AggregateRoot;
import org.springframework.data.domain.AbstractAggregateRoot;
import org.springframework.util.unit.DataSize;

import java.net.URI;
import java.time.LocalDateTime;

/**
 * @author dutianze
 * @date 2023/9/3
 */
public class Image extends AbstractAggregateRoot<Image> implements AggregateRoot<Image, ImageId> {

    private ImageId id;
    private Long diskSize;
    private byte[] imageData;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Image(byte[] imageData) {
        this.imageData = imageData;
        DataSize dataSize = DataSize.ofBytes(imageData.length);
        this.diskSize = dataSize.toKilobytes();
    }

    public static String getURL(String imageId) {
        if (StringUtils.isEmpty(imageId)) {
            return "";
        }
        return String.format("/api/image/%s", imageId);
    }

    public static String getId(String imageUrl) {
        if (StringUtils.isEmpty(imageUrl)) {
            throw new RuntimeException("not found url");
        }
        URI uri = URI.create(imageUrl);
        return StringUtils.substringAfterLast(uri.getPath(), "/");
    }

    @Override
    public ImageId getId() {
        return id;
    }
}
