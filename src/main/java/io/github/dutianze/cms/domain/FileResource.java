package io.github.dutianze.cms.domain;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.jmolecules.ddd.types.Association;
import org.jmolecules.ddd.types.Entity;
import org.springframework.util.unit.DataSize;

import javax.annotation.Nullable;
import java.net.URI;
import java.time.LocalDateTime;

/**
 * @author dutianze
 * @date 2023/9/3
 */
public class FileResource implements Entity<Post, FileResourceId>, Comparable<FileResource> {

    private FileResourceId id;

    private String filename;

    private Long size;

    private byte[] data;

    private Association<Post, PostId> post;

    @Nullable
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Nullable
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public FileResource(Post post, String filename, byte[] data) {
        this.id = new FileResourceId();
        this.filename = filename;
        this.data = data;
        this.post = Association.forAggregate(post);
        DataSize dataSize = DataSize.ofBytes(data.length);
        this.size = dataSize.toKilobytes();
        this.createdAt = LocalDateTime.now();
    }

    public FileResourceId getId(String url) {
        if (StringUtils.isEmpty(url)) {
            throw new RuntimeException("not found url");
        }
        URI uri = URI.create(url);
        return new FileResourceId(StringUtils.substringAfterLast(uri.getPath(), "/"));
    }

    public String getURL() {
        return String.format("/api/file-resource/%s", id.id());
    }

    @Override
    public FileResourceId getId() {
        return id;
    }

    @Override
    public int compareTo(FileResource o) {
        if (this.createdAt == null || o.createdAt == null) {
            return 0;
        }
        return this.createdAt.compareTo(o.createdAt);
    }

    public byte[] getData() {
        return data;
    }

    public void setId(FileResourceId id) {
        this.id = id;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public void setData(byte[] data) {
        this.data = data;
    }

    public Association<Post, PostId> getPost() {
        return post;
    }

    public void setPost(
            Association<Post, PostId> post) {
        this.post = post;
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
}
