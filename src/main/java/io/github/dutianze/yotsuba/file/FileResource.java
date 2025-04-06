package io.github.dutianze.yotsuba.file;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.jmolecules.ddd.types.AggregateRoot;
import org.springframework.util.unit.DataSize;

import javax.annotation.Nullable;
import java.time.LocalDateTime;

/**
 * @author dutianze
 * @date 2023/9/3
 */
public class FileResource implements AggregateRoot<FileResource, FileResourceId>, Comparable<FileResource> {

    private FileResourceId id;

    private String filename;

    private Long size;

    private byte[] data;

    @AttributeOverride(name = "referenceId.id", column = @Column(name = "reference_id"))
    private ReferenceInfo reference;

    @Nullable
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Nullable
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public FileResource(ReferenceInfo reference, String filename, byte[] data) {
        this.id = new FileResourceId();
        this.filename = filename;
        this.data = data;
        this.reference = reference;
        DataSize dataSize = DataSize.ofBytes(data.length);
        this.size = dataSize.toKilobytes();
        this.createdAt = LocalDateTime.now();
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

    public void setReference(ReferenceInfo reference) {
        this.reference = reference;
    }

    public void removeReference() {
        this.reference = null;
    }

    public void linkReference(ReferenceInfo reference) {
        this.reference = reference;
    }
}
