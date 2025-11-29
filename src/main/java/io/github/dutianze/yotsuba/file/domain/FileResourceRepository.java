package io.github.dutianze.yotsuba.file.domain;

import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.file.dto.FileResourceDto;
import io.github.dutianze.yotsuba.shared.common.ReferenceCategory;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
            f.updatedAt,
            f.thumbnailIndexList
        )
        FROM FileResource f
        ORDER BY f.createdAt DESC
        """)
    Page<FileResourceDto> findAllAsDto(Pageable pageable);

    @Query("""
        SELECT new io.github.dutianze.yotsuba.file.dto.FileResourceDto(
            f.id,
            f.filename,
            f.contentType,
            f.resourceType,
            f.fileSize,
            f.reference,
            f.createdAt,
            f.updatedAt,
            f.thumbnailIndexList
        )
        FROM FileResource f
        WHERE f.reference.referenceId.id = :noteId
          AND f.reference.referenceCategory = :category
        ORDER BY f.createdAt DESC
        """)
    Page<FileResourceDto> findByNoteIdAndCategory(@Param("noteId") String noteId,
                                                    @Param("category") ReferenceCategory category,
                                                    Pageable pageable);

    @Query("""
        SELECT new io.github.dutianze.yotsuba.file.dto.FileResourceDto(
            f.id,
            f.filename,
            f.contentType,
            f.resourceType,
            f.fileSize,
            f.reference,
            f.createdAt,
            f.updatedAt,
            f.thumbnailIndexList
        )
        FROM FileResource f
        WHERE f.reference.referenceId.id = :noteId
          AND f.reference.referenceCategory IN :categories
        ORDER BY f.createdAt DESC
        """)
    Page<FileResourceDto> findByNoteIdAndCategories(@Param("noteId") String noteId,
                                                     @Param("categories") List<ReferenceCategory> categories,
                                                    Pageable pageable);

    /**
     * 查找 data 有数据但 referenceId 为 null 的文件 ID
     * 使用原生 SQL 查询
     */
    @Query(value = """
        SELECT id
        FROM file_resource
        WHERE reference_id IS NULL
          AND data IS NOT NULL
        """, nativeQuery = true)
    List<String> findOrphanFileIds();

}
