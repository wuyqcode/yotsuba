package io.github.dutianze.cms.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

/**
 * @author dutianze
 * @date 2023/8/11
 */
public interface PostRepository extends CrudRepository<Post, PostId> {

    Page<Post> findAll(Pageable pageable);

    @Query(value = """
        SELECT p.*, bm25(fts5_post) AS score
        FROM post p
        JOIN fts5_post fts5_post ON p.id = fts5_post.id
        WHERE fts5_post MATCH :searchText
        ORDER BY score ASC
        """,
            nativeQuery = true)
    Page<Post> searchPost(@Param("searchText") String searchText, Pageable pageable);


    @Query(value = """
        INSERT INTO fts5_post(fts5_post) VALUES('rebuild');
        """,
            nativeQuery = true)
    @Modifying
    void rebuild();

}
