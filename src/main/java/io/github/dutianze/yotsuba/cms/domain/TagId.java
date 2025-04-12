package io.github.dutianze.yotsuba.cms.domain;

import io.hypersistence.tsid.TSID;
import jakarta.persistence.Embeddable;
import org.springframework.util.Assert;

/**
 * @author dutianze
 * @date 月曜日/2024/07/29
 */
@Embeddable
public record TagId(String id) {

    public TagId {
        Assert.notNull(id, "id must not be null");
    }

    public TagId() {
        this(TSID.Factory.getTsid().toString());
    }
}
