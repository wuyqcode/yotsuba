package io.github.dutianze.cms.domain;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

/**
 * @author dutianze
 * @date 2024/9/4
 */
public interface FTS5PostVocabRepository
        extends CrudRepository<FTS5PostVocab, FTS5PostVocabId>, JpaSpecificationExecutor<FTS5PostVocab> {

    static Specification<FTS5PostVocab> searchByKeywords(List<String> keywords) {
        return (root, query, criteriaBuilder) -> {
            if (keywords.isEmpty()) {
                return criteriaBuilder.disjunction();
            }
            return keywords.stream()
                           .map(keyword -> criteriaBuilder.like(root.get("id").get("term"), keyword + "%"))
                           .reduce(criteriaBuilder::or)
                           .orElse(criteriaBuilder.disjunction());
        };
    }
}
