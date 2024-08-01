package io.github.dutianze.cms;

import io.hypersistence.tsid.TSID;
import org.jmolecules.ddd.types.Identifier;
import org.springframework.util.Assert;

/**
 * @author dutianze
 * @date 月曜日/2024/07/29
 */
public record TagId(String id) implements Identifier {

    public TagId {
        Assert.notNull(id, "id must not be null");
    }

    public TagId() {
        this(TSID.Factory.getTsid().toString());
    }
}
