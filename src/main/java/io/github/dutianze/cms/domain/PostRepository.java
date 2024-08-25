package io.github.dutianze.cms.domain;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.repository.CrudRepository;

/**
 * @author dutianze
 * @date 2023/8/11
 */
public interface PostRepository extends CrudRepository<Post, PostId> {

    Slice<Post> findAll(Pageable pageable);

}
