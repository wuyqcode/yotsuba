package io.github.dutianze.cms;

import io.hypersistence.tsid.TSID;
import org.jmolecules.ddd.types.Identifier;
import org.springframework.util.Assert;

/**
 * @author dutianze
 * @date 金曜日/2024/07/26
 */
public record ChannelId(String id) implements Identifier {

    public ChannelId {
        Assert.notNull(id, "id must not be null");
    }

    public ChannelId() {
        this(TSID.Factory.getTsid().toString());
    }
}
