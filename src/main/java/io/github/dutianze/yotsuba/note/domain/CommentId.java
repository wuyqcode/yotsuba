package io.github.dutianze.yotsuba.note.domain;

import io.hypersistence.tsid.TSID;
import jakarta.persistence.Embeddable;
import org.springframework.util.Assert;

/**
 * @author dutianze
 * @date 月曜日/2024/07/29
 */
@Embeddable
public record CommentId(String id) {

    public CommentId {
        Assert.notNull(id, "id must not be null");
    }

    public CommentId() {
        this(TSID.Factory.getTsid().toString());
    }
}
