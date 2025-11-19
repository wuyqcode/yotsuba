package io.github.dutianze.yotsuba.file;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.util.unit.DataSize;

import java.time.LocalDateTime;

/**
 * @author dutianze
 * @date 2023/9/3
 */
@Data
@Entity
@Table
@NoArgsConstructor
public class FileResource implements Comparable<FileResource> {

    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "id"))
    private FileResourceId id;

    private String filename;

    private String contentType;

    private Long size;

    private byte[] data;

    @Embedded
    @AttributeOverride(name = "referenceId.id", column = @Column(name = "reference_id"))
    private ReferenceInfo reference;

    @Nullable
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Nullable
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public static FileResource create(ReferenceInfo reference, String filename, String contentType, byte[] data) {
        FileResource fileResource = new FileResource();
        fileResource.id = new FileResourceId();
        fileResource.filename = filename;
        fileResource.contentType = contentType;
        fileResource.data = data;
        fileResource.reference = reference;
        DataSize dataSize = DataSize.ofBytes(data.length);
        fileResource.size = dataSize.toKilobytes();
        fileResource.createdAt = LocalDateTime.now();
        return fileResource;
    }

    public FileResource(FileResourceId fileResourceId, String filename, String contentType, byte[] data) {
        this.id = fileResourceId;
        this.filename = filename;
        this.contentType = contentType;
        this.data = data;
        DataSize dataSize = DataSize.ofBytes(data.length);
        this.size = dataSize.toKilobytes();
        this.createdAt = LocalDateTime.now();
    }

    @Override
    public int compareTo(FileResource o) {
        if (this.createdAt == null || o.createdAt == null) {
            return 0;
        }
        return this.createdAt.compareTo(o.createdAt);
    }

    public void removeReference() {
        this.reference = null;
    }

    public void linkReference(ReferenceInfo reference) {
        this.reference = reference;
    }
}
