package io.github.dutianze.cms.domain;

import io.hypersistence.tsid.TSID;
import org.jmolecules.ddd.types.Identifier;
import org.springframework.util.Assert;

/**
 * @author dutianze
 * @date 月曜日/2024/07/29
 */
public record CommentId(String id) implements Identifier {

    public CommentId {
        Assert.notNull(id, "id must not be null");
    }

    public CommentId() {
        this(TSID.Factory.getTsid().toString());
    }
}
