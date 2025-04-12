package io.github.dutianze.yotsuba.file;

import io.github.dutianze.yotsuba.shared.common.Constant;
import io.hypersistence.tsid.TSID;
import jakarta.persistence.Embeddable;
import org.apache.commons.lang3.StringUtils;
import org.springframework.util.Assert;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * @author dutianze
 * @date 2024/7/31
 */
@Embeddable
public record FileResourceId(String id) {

    public FileResourceId {
        Assert.notNull(id, "id must not be null");
    }

    public FileResourceId() {
        this(TSID.Factory.getTsid().toString());
    }

    public static FileResourceId extractIdFromUrl(String url) {
        if (StringUtils.isEmpty(url)) {
            return new FileResourceId("");
        }
        return new FileResourceId(StringUtils.substringAfterLast(url, "/"));
    }

    public String getURL() {
        return UriComponentsBuilder.fromPath(Constant.FILE_RESOURCE_URL_PREFIX)
                                   .pathSegment(this.id)
                                   .build()
                                   .toUriString();
    }
}
