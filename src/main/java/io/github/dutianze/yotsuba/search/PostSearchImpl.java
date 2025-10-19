package io.github.dutianze.yotsuba.search;

import org.hibernate.search.engine.search.aggregation.AggregationKey;
import org.hibernate.search.engine.search.predicate.dsl.SearchPredicateFactory;
import org.hibernate.search.engine.search.query.SearchResult;
import org.hibernate.search.engine.search.sort.dsl.SearchSortFactory;
import org.hibernate.search.mapper.orm.Search;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import io.github.dutianze.yotsuba.note.domain.Post;

import java.util.List;
import java.util.Map;

/**
 * @author dutianze
 * @date 2025/4/6
 */
@Repository
public class PostSearchImpl extends HibernateSearchImpl<Post> implements PostSearch {


    public PostSearchImpl() {
        super(Post.class);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Page<Post> search(String searchTerm, Pageable pageable) {
        SearchSession searchSession = Search.session(entityManager);
        SearchResult<Post> searchResult =
                searchSession.search(Post.class)
                             .where(f -> {
                                 if (searchTerm == null) {
                                     return f.matchAll();
                                 } else {
                                     return f.match()
                                             .fields("content.content_en",
                                                     "content.content_cn",
                                                     "content.content_ja")
                                             .matching(searchTerm);
                                 }
                             })
                             .sort(SearchSortFactory::score)
                             .fetch(Math.toIntExact(pageable.getOffset()), pageable.getPageSize());

        long total = searchResult.total().hitCount();
        List<Post> posts = searchResult.hits();
        return new PageImpl<>(posts, pageable, total);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Map<String, Long> facet(String field, int maxCount) {
        SearchSession searchSession = Search.session(entityManager);
        AggregationKey<Map<String, Long>> countByKey = AggregationKey.of(field);

        SearchResult<Post> result = searchSession.search(Post.class)
                                                 .where(SearchPredicateFactory::matchAll)
                                                 .aggregation(countByKey, f -> f.terms()
                                                                                .field(field, String.class)
                                                                                .orderByCountDescending()
                                                                                .minDocumentCount(1)
                                                                                .maxTermCount(maxCount))
                                                 .fetch(20);

        result.hits();

        return result.aggregation(countByKey);
    }
}
