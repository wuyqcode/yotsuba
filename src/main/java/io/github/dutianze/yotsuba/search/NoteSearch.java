package io.github.dutianze.yotsuba.search;

import io.github.dutianze.yotsuba.note.application.dto.NoteCardDto;
import io.github.dutianze.yotsuba.note.domain.valueobject.CollectionId;
import io.github.dutianze.yotsuba.note.domain.valueobject.TagId;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NoteSearch extends HibernateSearch {

  /**
   * 全文検索する.
   *
   * @param searchText 検索文字列
   * @return 検索結果のリスト
   */
  Page<NoteCardDto> search(CollectionId collectionId, List<TagId> tagIdList, String searchText,
      Pageable pageable);

  /**
   * ファセットを作成する.
   *
   * @param field    対象となる項目
   * @param maxCount ファセットの最大件数
   * @return ファセットのマップ
   */
  Map<String, Long> facet(String field, int maxCount);
}
