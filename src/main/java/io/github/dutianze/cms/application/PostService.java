package io.github.dutianze.cms.application;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.Endpoint;
import io.github.dutianze.cms.domain.Post;
import io.github.dutianze.cms.domain.PostId;
import io.github.dutianze.cms.domain.PostRepository;
import io.github.dutianze.cms.domain.valueobject.PostTitle;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;

/**
 * @author dutianze
 * @date 2024/8/4
 */
@Endpoint
@AnonymousAllowed
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {this.postRepository = postRepository;}

    public Post findById(PostId id) {
        Post post = postRepository.findById(id).orElseThrow();
        return post;
    }

    @Transactional
    public String createPost() {
        Post post = new Post(new PostTitle("untitled"));
        Post savedPost = postRepository.save(post);
        return savedPost.getId().id();
    }

    @Transactional
    public void updatePost(Post post) {
        Post existingPost = postRepository.findById(post.getId())
                                          .orElseThrow(() -> new EntityNotFoundException(
                                                  "Post not found with id: " + post.getId()));

        existingPost.setTitle(post.getTitle());
        existingPost.setCover(post.getCover());
        existingPost.setContent(post.getContent());

        postRepository.save(existingPost);
    }
}
