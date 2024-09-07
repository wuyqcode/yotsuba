package io.github.dutianze.cms.application;

import com.google.common.collect.Lists;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.Endpoint;
import io.github.dutianze.cms.application.dto.PostDto;
import io.github.dutianze.cms.domain.*;
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

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author dutianze
 * @date 2024/8/4
 */
@Endpoint
@AnonymousAllowed
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final FTS5PostVocabRepository fts5PostVocabRepository;

    public PostService(PostRepository postRepository, FTS5PostVocabRepository fts5PostVocabRepository) {
        this.postRepository = postRepository;
        this.fts5PostVocabRepository = fts5PostVocabRepository;
    }

    public PostDto findById(String id) {
        Post post = postRepository.findById(new PostId(id)).orElseThrow(
                () -> new EntityNotFoundException("Post with ID " + id + " not found"));
        return PostDto.fromEntity(post);
    }

    public Page<PostDto> searchMessages(String searchText, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (StringUtils.isEmpty(searchText)) {
            Page<Post> posts = postRepository.findAll(pageable);
            return posts.map(PostDto::fromEntity);
        }
        try {
            String terms = Arrays.stream(searchText.split(" "))
                                 .flatMap(word -> Lists
                                         .partition(word.chars()
                                                        .mapToObj(c -> String.valueOf((char) c))
                                                        .collect(Collectors.toList()), 3)
                                         .stream())
                                 .map(partition -> String.join("", partition))
                                 .map(keyword -> fts5PostVocabRepository
                                         .findAll(FTS5PostVocabRepository.searchByKeywords(List.of(keyword)))
                                         .stream()
                                         .map(FTS5PostVocab::getTerm)
                                         .map(term -> "\"" + term + "\"")
                                         .collect(Collectors.joining(" OR ")))
                                 .filter(StringUtils::isNoneEmpty)
                                 .map(term -> "( " + term + " )")
                                 .collect(Collectors.joining(" AND "));
            if (StringUtils.isEmpty(terms)) {
                return Page.empty();
            }
            return postRepository.searchPost(terms, pageable).map(PostDto::fromEntity);
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
