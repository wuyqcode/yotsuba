package io.github.dutianze.cms.domain;

import io.hypersistence.tsid.TSID;
import org.jmolecules.ddd.types.Identifier;
import org.springframework.util.Assert;

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
}
