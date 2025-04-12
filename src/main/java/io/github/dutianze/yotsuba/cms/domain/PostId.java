package io.github.dutianze.yotsuba.cms.domain;

import io.hypersistence.tsid.TSID;
import jakarta.persistence.Embeddable;
import org.springframework.util.Assert;

/**
 * @author dutianze
 * @date 金曜日/2024/07/26
 */
@Embeddable
public record PostId(String id) {

    public PostId {
        Assert.notNull(id, "id must not be null");
    }

    public PostId() {
        this(TSID.Factory.getTsid().toString());
    }
}
