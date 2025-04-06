package io.github.dutianze.yotsuba.cms.domain;

import io.github.dutianze.yotsuba.cms.domain.valueobject.PostContent;
import io.github.dutianze.yotsuba.cms.domain.valueobject.PostStatus;
import io.github.dutianze.yotsuba.cms.domain.valueobject.PostTitle;
import io.github.dutianze.yotsuba.file.FileResourceId;
import io.github.dutianze.yotsuba.file.FileResourceReferenceAddedEvent;
import io.github.dutianze.yotsuba.file.FileResourceReferenceRemovedEvent;
import io.github.dutianze.yotsuba.search.PostIdentifierBridge;
import io.github.dutianze.yotsuba.shared.common.FileReferenceId;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.search.mapper.pojo.bridge.mapping.annotation.IdentifierBridgeRef;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.DocumentId;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.Indexed;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.IndexedEmbedded;
import org.jmolecules.ddd.types.AggregateRoot;
import org.springframework.data.domain.AbstractAggregateRoot;

import javax.annotation.Nullable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;

/**
 * @author dutianze
 * @date 2023/8/11
 */
@Indexed
public class Post extends AbstractAggregateRoot<Post> implements AggregateRoot<Post, PostId> {

    @DocumentId(identifierBridge = @IdentifierBridgeRef(type = PostIdentifierBridge.class))
    private PostId id;

    private PostTitle title;

//    @Embedded
    @AttributeOverride(name = "id", column = @Column(name = "cover_resource_id"))
    private FileResourceId cover;

    @IndexedEmbedded
    private PostContent content;

    private PostStatus postStatus = PostStatus.DRAFT;

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
        this.cover = new FileResourceId("");
        this.postStatus = PostStatus.DRAFT;
        this.content = new PostContent("");
        this.tags = new TreeSet<>(List.of(tags));
    }

    @Override
    public PostId getId() {
        return id;
    }

    public void setTitle(PostTitle title) {
        this.title = title;
    }

    public String getTitle() {
        return title.title();
    }

    public String getContent() {
        return content.content();
    }

    public PostStatus getPostStatus() {
        return postStatus;
    }

    public FileResourceId getCover() {
        return cover;
    }

    public void setId(PostId id) {
        this.id = id;
    }

    public void setPostStatus(PostStatus postStatus) {
        this.postStatus = postStatus;
    }

    public SortedSet<Comment> getComments() {
        return comments;
    }

    public void setComments(SortedSet<Comment> comments) {
        this.comments = comments;
    }

    public SortedSet<Tag> getTags() {
        return tags;
    }

    public void setTags(SortedSet<Tag> tags) {
        this.tags = tags;
    }

    @Nullable
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(@Nullable LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Nullable
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(@Nullable LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void afterCreated() {
        registerEvent(new PostCreated(id));
    }

    private void handleFileResourceReference(Set<FileResourceId> oldResourceIds, Set<FileResourceId> newResourceIds) {
        FileReferenceId fileReferenceId = new FileReferenceId(this.getId().id());
        oldResourceIds.stream()
                      .filter(fileResourceId -> !newResourceIds.contains(fileResourceId))
                      .forEach(fileResourceId -> registerEvent(
                              new FileResourceReferenceRemovedEvent(fileReferenceId, fileResourceId)));

        newResourceIds.stream()
                      .filter(resourceId -> !oldResourceIds.contains(resourceId))
                      .forEach(resourceId -> registerEvent(
                              FileResourceReferenceAddedEvent.forPostContent(fileReferenceId, resourceId)));
    }

    public void updatePostDetails(PostTitle title, FileResourceId cover, PostContent content,
                                  MarkdownExtractService markdownExtractService) {
        if (!this.cover.equals(cover)) {
            FileReferenceId fileReferenceId = new FileReferenceId(this.getId().id());
            registerEvent(new FileResourceReferenceRemovedEvent(fileReferenceId, this.cover));
            registerEvent(FileResourceReferenceAddedEvent.forPostContent(fileReferenceId, cover));
        }

        if (!this.content.equals(content)) {
            Set<FileResourceId> oldImageResourceIds =
                    markdownExtractService.extractFileReferenceIds(this.content.content());
            Set<FileResourceId> newImageResourceIds = markdownExtractService.extractFileReferenceIds(content.content());
            handleFileResourceReference(oldImageResourceIds, newImageResourceIds);
        }

        registerEvent(new PostUpdatedEvent(id));

        this.title = title;
        this.cover = cover;
        this.content = content;
    }
}