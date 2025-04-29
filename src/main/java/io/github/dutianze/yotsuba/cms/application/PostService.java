package io.github.dutianze.yotsuba.cms.application;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.Endpoint;
import io.github.dutianze.yotsuba.cms.application.dto.PageDto;
import io.github.dutianze.yotsuba.cms.application.dto.PostDto;
import io.github.dutianze.yotsuba.cms.domain.MarkdownExtractService;
import io.github.dutianze.yotsuba.cms.domain.Post;
import io.github.dutianze.yotsuba.cms.domain.PostId;
import io.github.dutianze.yotsuba.cms.domain.PostRepository;
import io.github.dutianze.yotsuba.cms.domain.valueobject.PostContent;
import io.github.dutianze.yotsuba.cms.domain.valueobject.PostTitle;
import io.github.dutianze.yotsuba.file.FileResourceId;
import io.github.dutianze.yotsuba.search.PostSearch;
import jakarta.persistence.EntityNotFoundException;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * @author dutianze
 * @date 2024/8/4
 */
@Endpoint
@AnonymousAllowed
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final PostSearch postSearch;
    private final MarkdownExtractService markdownExtractService;

    public PostService(PostRepository postRepository, PostSearch postSearch,
                       MarkdownExtractService markdownExtractService) {
        this.postRepository = postRepository;
        this.postSearch = postSearch;
        this.markdownExtractService = markdownExtractService;
    }

    public PostDto findById(String id) {
        Post post = postRepository.findById(new PostId(id)).orElseThrow(
                () -> new EntityNotFoundException("Post with ID " + id + " not found"));
        return PostDto.fromEntity(post);
    }

    public PageDto<PostDto> searchMessages(String searchText, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (StringUtils.isEmpty(searchText)) {
            Page<Post> posts = postRepository.findAll(pageable);
            return PageDto.from(posts.map(PostDto::fromEntity));
        }
        Page<Post> postPage = postSearch.search(searchText, pageable);
        return PageDto.from(postPage.map(PostDto::fromEntity));
    }

    @Transactional
    public String createPost() {
        Post post = new Post(new PostTitle("untitled"));
        post.afterCreated();
        Post savedPost = postRepository.save(post);
        return savedPost.getId().id();
    }

    @Transactional
    public void updatePost(String id, String title, String cover, String content) {
        Post existingPost = postRepository.findById(new PostId(id))
                                          .orElseThrow(
                                                  () -> new EntityNotFoundException("Post not found with id: " + id));

        existingPost.updatePostDetails(new PostTitle(title),
                                       FileResourceId.extractIdFromUrl(cover),
                                       new PostContent(content),
                                       markdownExtractService);
        postRepository.save(existingPost);
    }
}
