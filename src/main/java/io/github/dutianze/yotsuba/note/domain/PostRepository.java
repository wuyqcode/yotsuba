package io.github.dutianze.yotsuba.note.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;

/**
 * @author dutianze
 * @date 2023/8/11
 */
public interface PostRepository extends CrudRepository<Post, PostId> {

    Page<Post> findAll(Pageable pageable);
}
