package io.github.dutianze.cms;

import org.jmolecules.ddd.types.AggregateRoot;
import org.jmolecules.ddd.types.Association;

/**
 * @author dutianze
 * @date 月曜日/2024/07/29
 */
public class Comment implements AggregateRoot<Comment, CommentId> {

    private CommentId id;

    private String content;

    private Association<Memo, MemoId> memo;

    public Comment(String content, Memo memo) {
        this.id = new CommentId();
        this.content = content;
        this.memo = Association.forAggregate(memo);
    }

    @Override
    public CommentId getId() {
        return id;
    }
}
