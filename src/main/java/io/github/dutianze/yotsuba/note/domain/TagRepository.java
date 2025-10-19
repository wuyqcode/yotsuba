package io.github.dutianze.yotsuba.note.domain;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author dutianze
 * @date 2023/9/5
 */
public interface TagRepository extends JpaRepository<Tag, String> {
}
