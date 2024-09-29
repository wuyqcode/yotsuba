package io.github.dutianze.cms.infrastructure;

import io.github.dutianze.cms.domain.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

/**
 * @author dutianze
 * @date 2024/9/8
 */
@Component
public class PostFTS5EventListener {

    private static final Logger logger = LoggerFactory.getLogger(PostFTS5EventListener.class);
    private final PostRepository postRepository;
    private final JdbcTemplate jdbcTemplate;

    public PostFTS5EventListener(PostRepository postRepository, JdbcTemplate jdbcTemplate) {
        this.postRepository = postRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @ApplicationModuleListener
    public void handle(PostCreated event) {
        PostId postId = event.postId();
        logger.info("PostCreated event triggered for Post ID: {}", postId);

        Post post = postRepository.findById(postId)
                                  .orElseThrow(() -> new RuntimeException("Post not found with ID: " + postId));

        String sql = "INSERT INTO fts5_post(id, title, content) VALUES (?, ?, ?)";

        jdbcTemplate.update(sql, postId.id(), post.getTitle(), post.getContent());
    }

    @ApplicationModuleListener
    public void handle(PostUpdatedEvent event) {
        PostId postId = event.postId();
        logger.info("PostUpdate event triggered for Post ID: {}", postId);

        Post post = postRepository.findById(postId)
                                  .orElseThrow(() -> new RuntimeException("Post not found with ID: " + postId));

        String sqlDelete = "DELETE FROM fts5_post WHERE id=?";
        String sqlInsert = "INSERT INTO fts5_post(id, title, content) VALUES (?, ?, ?)";

        jdbcTemplate.update(sqlDelete, postId.id());
        jdbcTemplate.update(sqlInsert, postId.id(), post.getTitle(), post.getContent());
    }

    @ApplicationModuleListener
    public void handle(PostDeleted event) {
        PostId postId = event.postId();
        logger.info("PostDeleted event triggered for Post ID: {}", postId);

        postRepository.findById(postId)
                      .orElseThrow(() -> new RuntimeException("Post not found with ID: " + postId));

        String sql = "DELETE FROM fts5_post WHERE id=?";

        jdbcTemplate.update(sql, postId.id());
    }
}