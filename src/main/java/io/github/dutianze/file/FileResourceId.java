package io.github.dutianze.file;

import io.github.dutianze.shared.common.Constant;
import io.hypersistence.tsid.TSID;
import org.apache.commons.lang3.StringUtils;
import org.jmolecules.ddd.types.Identifier;
import org.springframework.util.Assert;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * @author dutianze
 * @date 2024/7/31
 */
public record FileResourceId(String id) implements Identifier {

    public FileResourceId {
        Assert.notNull(id, "id must not be null");
    }

    public FileResourceId() {
        this(TSID.Factory.getTsid().toString());
    }

    public static FileResourceId extractIdFromUrl(String url) {
        return new FileResourceId(StringUtils.substringAfterLast(url, "/"));
    }

    public String getURL() {
        return UriComponentsBuilder.fromPath(Constant.FILE_RESOURCE_URL_PREFIX)
                                   .pathSegment(this.id)
                                   .build()
                                   .toUriString();
    }
}
