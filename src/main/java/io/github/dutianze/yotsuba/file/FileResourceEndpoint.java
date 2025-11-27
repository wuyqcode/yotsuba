package io.github.dutianze.yotsuba.file;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.Endpoint;
import io.github.dutianze.yotsuba.file.domain.FileResource;
import io.github.dutianze.yotsuba.file.domain.FileResourceRepository;
import io.github.dutianze.yotsuba.file.domain.valueobject.FileResourceId;
import io.github.dutianze.yotsuba.shared.common.ReferenceCategory;
import io.github.dutianze.yotsuba.file.dto.FileResourceDto;
import io.github.dutianze.yotsuba.file.service.FileService;
import io.github.dutianze.yotsuba.note.application.dto.PageDto;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Endpoint
@AnonymousAllowed
@RequiredArgsConstructor
public class FileResourceEndpoint {

  private final FileResourceRepository fileResourceRepository;
  private final FileService fileService;

  @Nonnull
  public PageDto<FileResourceDto> list(int page, int size) {
    Pageable pageable = PageRequest.of(page, size);

    Page<FileResourceDto> fileResources = fileResourceRepository.findAllAsDto(pageable);
    return PageDto.from(fileResources);
  }

  @Nonnull
  public FileResource upload(MultipartFile file, @Nullable String referenceId,
                             @Nullable ReferenceCategory referenceCategory) throws Exception {
    String password = "123";
    return fileService.upload(file, password, referenceId, referenceCategory);
  }

  @Nonnull
  public Boolean deleteFile(String id) {
    return fileService.deleteFileFromDatabaseAndFileSystem(new FileResourceId(id));
  }

  @Nonnull
  public PageDto<FileResourceDto> listByNoteId(String noteId, int page, int size) {
    Pageable pageable = PageRequest.of(page, size);
    Page<FileResourceDto> fileResources = fileResourceRepository.findByNoteIdAndCategory(
            noteId, ReferenceCategory.NOTE_ATTACHMENT, pageable);
    return PageDto.from(fileResources);
  }

}
