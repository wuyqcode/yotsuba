package io.github.dutianze.cms;

import io.hypersistence.tsid.TSID;
import org.springframework.util.Assert;

/**
 * @author dutianze
 * @date 2024/7/31
 */
public record MemoCoverId(String id) {

    public MemoCoverId {
        Assert.notNull(id, "id must not be null");
    }

    public MemoCoverId() {
        this(TSID.Factory.getTsid().toString());
    }
}
