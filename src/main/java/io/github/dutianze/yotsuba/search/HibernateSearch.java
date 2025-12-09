package io.github.dutianze.yotsuba.search;

/**
 * @author dutianze
 * @date 2025/4/6
 */
public interface HibernateSearch {

    /**
     * インデックスを再作成する.
     */
    void reindex();

    /**
     * 全てのインデックスを再作成する.
     *
     * @param async
     *            true:非同期、false:同期
     */
    void reindexAll(boolean async);
}

