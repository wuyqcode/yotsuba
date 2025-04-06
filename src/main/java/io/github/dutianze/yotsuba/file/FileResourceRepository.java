package io.github.dutianze.yotsuba.file;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author dutianze
 * @date 2023/9/3
 */
public interface FileResourceRepository extends JpaRepository<FileResource, FileResourceId> {

}
