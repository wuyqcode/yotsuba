package io.github.dutianze.yotsuba.note.application;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.Endpoint;
import io.github.dutianze.yotsuba.note.application.dto.CollectionDto;
import io.github.dutianze.yotsuba.note.domain.Collection;
import io.github.dutianze.yotsuba.note.domain.CollectionRepository;
import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionId;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.transaction.annotation.Transactional;

@Endpoint
@AnonymousAllowed
public class CollectionService {

  private final CollectionRepository collectionRepository;

  public CollectionService(CollectionRepository collectionRepository) {
    this.collectionRepository = collectionRepository;
  }

  @Transactional(readOnly = true)
  public List<CollectionDto> findAllCollections() {
    return collectionRepository.findAll(Sort.by(Direction.ASC, "id")).stream()
        .map(c -> new CollectionDto(
            c.getId().id(),
            c.getName()
        ))
        .collect(Collectors.toList());
  }

  @Transactional
  public CollectionDto createCollection(String name) {
    if (StringUtils.isBlank(name)) {
      throw new IllegalArgumentException("Collection name cannot be empty");
    }
    Collection c = Collection.create(name);
    collectionRepository.save(c);
    return new CollectionDto(c.getId().id(), c.getName());
  }

  @Transactional
  public void updateCollection(String id, String name) {
    Collection c = collectionRepository.findById(new CollectionId(id))
        .orElseThrow(() -> new EntityNotFoundException("Collection not found: " + id));
    c.setName(name);
    collectionRepository.save(c);
  }

  @Transactional
  public void deleteCollection(String id) {
    collectionRepository.findById(new CollectionId(id))
        .ifPresentOrElse(collectionRepository::delete,
            () -> {
              throw new EntityNotFoundException("Collection not found: " + id);
            });
  }
}
