package io.github.dutianze.yotsuba.cms.domain;

import io.github.dutianze.yotsuba.cms.domain.valueobject.PostContent;
import io.github.dutianze.yotsuba.cms.domain.valueobject.PostStatus;
import io.github.dutianze.yotsuba.cms.domain.valueobject.PostTitle;
import io.github.dutianze.yotsuba.file.FileResourceId;
import io.github.dutianze.yotsuba.file.FileResourceReferenceAddedEvent;
import io.github.dutianze.yotsuba.file.FileResourceReferenceRemovedEvent;
import io.github.dutianze.yotsuba.search.PostIdentifierBridge;
import io.github.dutianze.yotsuba.shared.common.FileReferenceId;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.search.mapper.pojo.bridge.mapping.annotation.IdentifierBridgeRef;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.DocumentId;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.Indexed;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.IndexedEmbedded;
import org.springframework.data.domain.AbstractAggregateRoot;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

/**
 * @author dutianze
 * @date 2023/8/11
 */
@EqualsAndHashCode(callSuper = true)
@Data
@Indexed
@Entity
@Table
@AllArgsConstructor
@NoArgsConstructor
public class Post extends AbstractAggregateRoot<Post> implements Comparable<Post>{

    @EmbeddedId
    @DocumentId(identifierBridge = @IdentifierBridgeRef(type = PostIdentifierBridge.class))
    @AttributeOverride(name = "id", column = @Column(name = "id"))
    private PostId id;

    @Embedded
    @AttributeOverride(name = "title", column = @Column(name = "title"))
    private PostTitle title;

    @Embedded
    @AttributeOverride(name = "id", column = @Column(name = "cover_resource_id"))
    private FileResourceId cover;

    @IndexedEmbedded
    private PostContent content;

    @Column(name = "post_status")
    @Enumerated
    private PostStatus postStatus = PostStatus.DRAFT;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.EAGER)
    @JoinTable(
            name = "post_tag",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new TreeSet<>();

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

    @Override
    public int compareTo(Post o) {
        return this.id.id().compareTo(o.id.id());
    }
}