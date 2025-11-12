package io.github.dutianze.yotsuba.search;

import com.atilika.kuromoji.ipadic.neologd.Token;
import io.github.dutianze.yotsuba.file.FileResourceId;
import io.github.dutianze.yotsuba.note.application.dto.NoteCardDto;
import io.github.dutianze.yotsuba.note.domain.Note;
import io.github.dutianze.yotsuba.tool.domain.common.Constant;
import io.github.dutianze.yotsuba.tool.domain.common.StringHelper;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.Getter;
import org.hibernate.search.engine.search.aggregation.AggregationKey;
import org.hibernate.search.engine.search.predicate.dsl.SearchPredicateFactory;
import org.hibernate.search.engine.search.query.SearchResult;
import org.hibernate.search.engine.search.sort.dsl.SearchSortFactory;
import org.hibernate.search.mapper.orm.Search;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.EntityProjection;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.HighlightProjection;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.ProjectionConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public class NoteSearchImpl extends HibernateSearchImpl<Note> implements NoteSearch {

  public NoteSearchImpl() {
    super(Note.class);
  }

  @ProjectionConstructor
  public record NoteSingleHighlightProjection(
      @HighlightProjection(path = "content.content_en") String enHighlight,
      @HighlightProjection(path = "content.content_cn") String cnHighlight,
      @HighlightProjection(path = "content.content_ja") String jaHighlight,
      @EntityProjection Note note
  ) {

  }

  @Getter
  public enum LanguageType {
    EN("content.content_en"),
    CN("content.content_cn"),
    JA("content.content_ja");

    private final String field;

    LanguageType(String field) {
      this.field = field;
    }

    public static LanguageType detectLanguage(String input) {
      if (input == null || input.isBlank()) {
        return EN;
      }

      // 含英文字母 → 英语
      if (input.codePoints().anyMatch(Character::isAlphabetic)
          && !StringHelper.containsKanji(input)) {
        return EN;
      }

      // 含假名 → 日语
      if (StringHelper.containsHiragana(input) || StringHelper.containsKatakana(input)) {
        return JA;
      }

      List<Token> tokenize = Constant.tokenizer.tokenize(input);
      boolean allKnown = tokenize.stream().allMatch(Token::isKnown);
      if (allKnown) {
        return JA;
      }

      return CN;
    }

    public String extractHighlight(NoteSingleHighlightProjection p) {
      return switch (this) {
        case EN -> p.enHighlight();
        case CN -> p.cnHighlight();
        case JA -> p.jaHighlight();
      };
    }
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public Page<NoteCardDto> search(String searchTerm, Pageable pageable) {
    LanguageType lang = LanguageType.detectLanguage(searchTerm);
    SearchSession searchSession = Search.session(entityManager);
    SearchResult<NoteSingleHighlightProjection> result = searchSession.search(Note.class)
        .select(NoteSingleHighlightProjection.class)
        .where(f -> {
          if (searchTerm == null) {
            return f.matchAll();
          } else {
            return f.match().field(lang.getField()).matching(searchTerm).fuzzy(1, 2);
          }
        })
        .highlighter(f -> f.fastVector()
            .tag("<mark>", "</mark>")
            .numberOfFragments(1)
            .orderByScore(true)
            .fragmentSize(300))
        .sort(SearchSortFactory::score)
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
