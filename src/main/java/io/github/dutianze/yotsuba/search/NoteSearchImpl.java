package io.github.dutianze.yotsuba.search;

import io.github.dutianze.yotsuba.file.FileResourceId;
import io.github.dutianze.yotsuba.note.application.dto.NoteCardDto;
import io.github.dutianze.yotsuba.note.domain.Note;
import io.github.dutianze.yotsuba.note.domain.Tag;
import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionId;
import io.github.dutianze.yotsuba.note.domain.valueobject.TagId;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.search.engine.search.aggregation.AggregationKey;
import org.hibernate.search.engine.search.predicate.dsl.SearchPredicateFactory;
import org.hibernate.search.engine.search.query.SearchResult;
import org.hibernate.search.mapper.orm.Search;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public class NoteSearchImpl extends HibernateSearchImpl<Note> implements NoteSearch {

  public NoteSearchImpl() {
    super(Note.class);
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public Page<NoteCardDto> search(CollectionId collectionId, List<TagId> tagIdList,
      String searchText, Pageable pageable) {
    LanguageType lang = LanguageType.detectLanguage(searchText);
    SearchSession searchSession = Search.session(entityManager);
    boolean hasSearch = StringUtils.isNotBlank(searchText);

    SearchResult<NoteSingleHighlightProjection> result = searchSession.search(Note.class)
        .select(NoteSingleHighlightProjection.class)
        .where(f -> f.bool().with(b -> {
          // --- 公共条件 ---
          b.filter(f.match().field("collection.id").matching(collectionId));
          Optional.ofNullable(tagIdList)
              .orElseGet(List::of)
              .forEach(id -> b.filter(f.match().field("tags.id").matching(id)));
          // --- 可选条件 ---
          if (hasSearch) {
            b.should(f.match().fields(lang.getFields()).matching(searchText).fuzzy(1, 2));
          } else {
            b.must(f.matchAll());
          }
        }))
        .highlighter(f -> f.fastVector()
            .tag("<mark>", "</mark>")
            .numberOfFragments(1)
            .orderByScore(true)
            .fragmentSize(300))
        .sort(f -> {
          if (hasSearch) {
            return f.score();
          }
          return f.field("createdAt").desc();
        })
        .fetch(Math.toIntExact(pageable.getOffset()), pageable.getPageSize());

    long total = result.total().hitCount();
    List<NoteSingleHighlightProjection> hits = result.hits();

    List<NoteCardDto> dtoList = hits.stream().map(p -> {
      String highlight = lang.extractHighlight(p);
      return NoteCardDto.builder()
          .id(p.note().getId().id())
          .title(p.note().getTitle().title())
          .cover(Optional.ofNullable(p.note().getCover()).map(FileResourceId::getUrl).orElse(""))
          .author("匿名作者")
          .snippet(highlight)
          .likes(1)
          .tags(p.note().getTags().stream().map(Tag::getName).toList())
          .verified(true)
          .noteType(p.note().getNoteType())
          .build();
    }).toList();

    return new PageImpl<>(dtoList, pageable, total);
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public Map<String, Long> facet(String field, int maxCount) {
    SearchSession searchSession = Search.session(entityManager);
    AggregationKey<Map<String, Long>> countByKey = AggregationKey.of(field);

    SearchResult<Note> result = searchSession.search(Note.class)
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
