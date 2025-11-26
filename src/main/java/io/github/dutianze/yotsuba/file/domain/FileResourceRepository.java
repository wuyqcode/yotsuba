package io.github.dutianze.yotsuba.file.domain;

import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.file.dto.FileResourceDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FileResourceRepository extends JpaRepository<FileResource, FileResourceId> {

    @Query("""
        SELECT new io.github.dutianze.yotsuba.file.dto.FileResourceDto(
            f.id,
            f.filename,
            f.contentType,
            f.resourceType,
            f.fileSize,
            f.reference,
            f.createdAt,
            f.updatedAt
        )
        FROM FileResource f
        ORDER BY f.createdAt DESC
        """)
    Page<FileResourceDto> findAllAsDto(Pageable pageable);

}
