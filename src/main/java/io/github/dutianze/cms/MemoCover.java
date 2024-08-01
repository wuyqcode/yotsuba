package io.github.dutianze.cms;

import org.jmolecules.ddd.types.Entity;

/**
 * @author dutianze
 * @date 2024/7/31
 */
public record MemoCover(MemoCoverId id, String imageUrl) implements Entity<Memo, MemoCoverId> {

    public MemoCover(String imageUrl) {
        this(new MemoCoverId(), imageUrl);
    }

    @Override
    public MemoCoverId getId() {
        return id;
    }
}
