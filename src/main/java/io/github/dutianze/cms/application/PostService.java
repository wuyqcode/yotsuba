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
import org.springframework.data.domain.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

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

    public PostDto findById(String id) {
        Post post = postRepository.findById(new PostId(id)).orElseThrow(
                () -> new EntityNotFoundException("Post with ID " + id + " not found"));
        return PostDto.fromEntity(post);
    }

    public Slice<PostDto> getPosts(Integer page, Integer size, String sortBy, String sortDir) {
        page = Optional.ofNullable(page).orElse(0);
        size = Optional.ofNullable(size).orElse(10);
        sortBy = Optional.ofNullable(sortBy)
                         .filter(StringUtils::isNoneEmpty)
                         .orElse("createdAt");
        sortDir = Optional.ofNullable(sortDir)
                          .filter(StringUtils::isNoneEmpty)
                          .orElse("desc");

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Slice<Post> posts = postRepository.findAll(pageable);
        return posts.map(PostDto::fromEntity);
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
