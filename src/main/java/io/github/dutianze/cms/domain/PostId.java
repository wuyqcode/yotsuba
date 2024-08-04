package io.github.dutianze.cms.domain;

import io.hypersistence.tsid.TSID;
import org.jmolecules.ddd.types.Identifier;
import org.springframework.util.Assert;

/**
 * @author dutianze
 * @date 金曜日/2024/07/26
 */
public record PostId(String id) implements Identifier {

    public PostId {
        Assert.notNull(id, "id must not be null");
    }

    public PostId() {
        this(TSID.Factory.getTsid().toString());
    }
}
