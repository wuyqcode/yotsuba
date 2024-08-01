package io.github.dutianze.cms;

import io.hypersistence.tsid.TSID;
import org.jmolecules.ddd.types.Identifier;
import org.springframework.util.Assert;

/**
 * @author dutianze
 * @date 月曜日/2024/07/29
 */
public record ImageId(String id) implements Identifier {

    public ImageId {
        Assert.notNull(id, "id must not be null");
    }

    public ImageId() {
        this(TSID.Factory.getTsid().toString());
    }
}
