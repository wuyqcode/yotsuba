package io.github.dutianze.cms.application;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.Endpoint;
import io.github.dutianze.cms.application.dto.PostDto;
import io.github.dutianze.cms.domain.Post;
import io.github.dutianze.cms.domain.PostId;
import io.github.dutianze.cms.domain.PostRepository;
import io.github.dutianze.cms.domain.valueobject.PostContent;
import io.github.dutianze.cms.domain.valueobject.PostCover;
import io.github.dutianze.cms.domain.valueobject.PostTitle;
import jakarta.persistence.EntityNotFoundException;
import org.apache.commons.lang3.StringUtils;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

/**
 * @author dutianze
 * @date 2024/8/4
 */
@Endpoint
@AnonymousAllowed
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {this.postRepository = postRepository;}

    public PostDto findById(String id) {
        Post post = postRepository.findById(new PostId(id)).orElseThrow(
                () -> new EntityNotFoundException("Post with ID " + id + " not found"));
        return PostDto.fromEntity(post);
    }

    @Transactional
    public Page<PostDto> searchMessages(String searchText, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (StringUtils.isEmpty(searchText)) {
            Page<Post> posts = postRepository.findAll(pageable);
            return posts.map(PostDto::fromEntity);
        }
        try {
            return postRepository.searchPost(searchText, pageable).map(PostDto::fromEntity);
        } catch (DataAccessResourceFailureException e) {
            postRepository.rebuild();
            Page<Post> posts = postRepository.searchPost(searchText, pageable);
            return posts.map(PostDto::fromEntity);
        }
    }

    @Transactional
    public String createPost() {
        Post post = new Post(new PostTitle("untitled"));
        Post savedPost = postRepository.save(post);
        return savedPost.getId().id();
    }

    @Transactional
    public void updatePost(String id, String title, String cover, String content) {
        Post existingPost = postRepository.findById(new PostId(id))
                                          .orElseThrow(() -> new EntityNotFoundException(
                                                  "Post not found with id: " + id));

        existingPost.setTitle(new PostTitle(title));
        existingPost.setCover(new PostCover(cover));
        existingPost.setContent(new PostContent(content));

        postRepository.save(existingPost);
    }
}
