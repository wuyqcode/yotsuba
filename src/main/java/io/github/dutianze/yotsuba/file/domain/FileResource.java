package io.github.dutianze.yotsuba.file.domain;

import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.file.domain.valueobject.ReferenceInfo;
import io.github.dutianze.yotsuba.file.domain.valueobject.ResourceType;
import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.util.unit.DataSize;

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

  @Column(name = "resource_type")
  @Enumerated(EnumType.STRING)
  private ResourceType resourceType;

  @Column(name = "encrypted")
  private boolean encrypted;

  @Column(name = "password_hash")
  private String passwordHash;

  @Column(name = "file_size")
  private Long fileSize;

  private byte[] data;

  @Embedded
  @AttributeOverrides({
          @AttributeOverride(name = "referenceId.id", column = @Column(name = "reference_id")),
          @AttributeOverride(name = "referenceTypeDeprecated", column = @Column(name = "reference_type")),
          @AttributeOverride(name = "referenceCategory", column = @Column(name = "reference_category"))
  })
  private ReferenceInfo reference;

  @Nullable
  @CreationTimestamp
  private LocalDateTime createdAt;

  @Nullable
  @UpdateTimestamp
  private LocalDateTime updatedAt;

  public static FileResource create(ReferenceInfo reference, String filename, String contentType,
                                    byte[] data, String passwordHash) {
    FileResource fileResource = new FileResource();
    fileResource.id = new FileResourceId();
    fileResource.filename = filename;
    fileResource.contentType = contentType;
    fileResource.data = data;
    fileResource.reference = reference;
    DataSize dataSize = DataSize.ofBytes(data.length);
    fileResource.fileSize = dataSize.toKilobytes();
    fileResource.resourceType = ResourceType.LOCAL;
    fileResource.passwordHash = passwordHash;
    return fileResource;
  }

  public FileResource(FileResourceId fileResourceId, String filename, String contentType,
                      byte[] data) {
    this.id = fileResourceId;
    this.filename = filename;
    this.contentType = contentType;
    this.data = data;
    DataSize dataSize = DataSize.ofBytes(data.length);
    this.fileSize = dataSize.toKilobytes();
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
