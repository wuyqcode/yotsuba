package io.github.dutianze.yotsuba.shared.domain.valueobject;

import io.hypersistence.tsid.TSID;
import jakarta.persistence.Embeddable;
import org.springframework.util.Assert;

@Embeddable
public record UserId(String id) {

    public UserId {
        Assert.notNull(id, "id must not be null");
    }

    public UserId() {
        this(TSID.Factory.getTsid().toString());
    }
}
