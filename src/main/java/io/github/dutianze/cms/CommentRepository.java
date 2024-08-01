package io.github.dutianze.cms;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author dutianze
 * @date 2024/7/31
 */
public interface CommentRepository extends JpaRepository<Comment, CommentId> {
}
