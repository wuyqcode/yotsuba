package io.github.dutianze.yotsuba.note.domain.repository;

import io.github.dutianze.yotsuba.note.domain.Collection;
import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CollectionRepository extends JpaRepository<Collection, CollectionId> {

}
