package io.github.dutianze.yotsuba.note.application;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.Endpoint;

import io.github.dutianze.yotsuba.file.FileResourceId;
import io.github.dutianze.yotsuba.note.application.dto.PageDto;
import io.github.dutianze.yotsuba.note.application.dto.NoteDto;
import io.github.dutianze.yotsuba.note.domain.MarkdownExtractService;
import io.github.dutianze.yotsuba.note.domain.Post;
import io.github.dutianze.yotsuba.note.domain.PostId;
import io.github.dutianze.yotsuba.note.domain.PostRepository;
import io.github.dutianze.yotsuba.note.domain.valueobject.PostContent;
import io.github.dutianze.yotsuba.note.domain.valueobject.PostTitle;
import io.github.dutianze.yotsuba.search.PostSearch;
import jakarta.persistence.EntityNotFoundException;
import org.apache.commons.lang3.StringUtils;
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
@Transactional(readOnly = true)
public class NoteService {

    private final PostRepository postRepository;
    private final PostSearch postSearch;
    private final MarkdownExtractService markdownExtractService;

    public NoteService(PostRepository postRepository, PostSearch postSearch,
                       MarkdownExtractService markdownExtractService) {
        this.postRepository = postRepository;
        this.postSearch = postSearch;
        this.markdownExtractService = markdownExtractService;
    }

    public NoteDto findById(String id) {
        Post post = postRepository.findById(new PostId(id)).orElseThrow(
                () -> new EntityNotFoundException("Post with ID " + id + " not found"));
        return NoteDto.fromEntity(post);
    }

    public PageDto<NoteDto> searchMessages(String searchText, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (StringUtils.isEmpty(searchText)) {
            Page<Post> posts = postRepository.findAll(pageable);
            return PageDto.from(posts.map(NoteDto::fromEntity));
        }
        Page<Post> postPage = postSearch.search(searchText, pageable);
        return PageDto.from(postPage.map(NoteDto::fromEntity));
    }

    @Transactional
    public String createNote() {
        Post post = new Post(new PostTitle("untitled"));
        post.afterCreated();
        Post savedPost = postRepository.save(post);
        return savedPost.getId().id();
    }

    @Transactional
    public void updateNote(String id, String title, String cover, String content) {
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
