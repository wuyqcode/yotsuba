package io.github.dutianze.cms.domain;

import io.github.dutianze.cms.domain.valueobject.PostContent;
import io.github.dutianze.cms.domain.valueobject.PostStatus;
import io.github.dutianze.cms.domain.valueobject.PostTitle;
import jakarta.persistence.CascadeType;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToMany;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.jmolecules.ddd.types.AggregateRoot;
import org.springframework.data.domain.AbstractAggregateRoot;

import javax.annotation.Nullable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.SortedSet;
import java.util.TreeSet;

/**
 * @author dutianze
 * @date 2023/8/11
 */
public class Post extends AbstractAggregateRoot<Post> implements AggregateRoot<Post, PostId> {

    private PostId id;

    private PostTitle title;

    private PostContent content;

    private PostStatus postStatus = PostStatus.DRAFT;

    private SortedSet<FileResource> fileResources = new TreeSet<>();

    private SortedSet<Comment> comments = new TreeSet<>();

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.EAGER)
    private SortedSet<Tag> tags;

    @Nullable
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Nullable
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Post(PostTitle postTitle, Tag... tags) {
        this.id = new PostId();
        this.title = postTitle;
        this.postStatus = PostStatus.DRAFT;
        this.content = new PostContent("");
        this.tags = new TreeSet<>(List.of(tags));
    }

    @Override
    public PostId getId() {
        return id;
    }

    public String addFileResource(String filename, byte[] data) {
        FileResource fileResource = new FileResource(this, filename, data);
        this.fileResources.add(fileResource);
        return fileResource.getURL();
    }

    public void setTitle(PostTitle title) {
        this.title = title;
    }

    public void setContent(PostContent content) {
        this.content = content;
    }

    public PostTitle getTitle() {
        return title;
    }

    public PostContent getContent() {
        return content;
    }

    public PostStatus getPostStatus() {
        return postStatus;
    }

}