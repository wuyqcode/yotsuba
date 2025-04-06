package io.github.dutianze.yotsuba.search;

import io.github.dutianze.yotsuba.cms.domain.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * @author dutianze
 * @date 2025/4/6
 */
public interface PostSearch extends HibernateSearch {

    /**
     * 全文検索する.
     *
     * @param searchTerm 検索文字列
     * @return 検索結果のリスト
     */
    Page<Post> search(String searchTerm, Pageable pageable);

    /**
     * ファセットを作成する.
     *
     * @param field    対象となる項目
     * @param maxCount ファセットの最大件数
     * @return ファセットのマップ
     */
    Map<String, Long> facet(String field, int maxCount);
}
