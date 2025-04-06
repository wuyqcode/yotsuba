package io.github.dutianze.yotsuba.search;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.validation.constraints.NotNull;

/**
 * @author dutianze
 * @date 2025/4/6
 */
public class HibernateSearchImpl<T> implements HibernateSearch {

    @PersistenceContext
    protected EntityManager entityManager;

    @NotNull
    private final Class<T> persistentClass;

    public HibernateSearchImpl(@NotNull Class<T> persistentClass) {
        this.persistentClass = persistentClass;
    }

    @Override
    public void reindex() {
        HibernateSearchTools.reindex(persistentClass, entityManager);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void reindexAll(boolean async) {
        HibernateSearchTools.reindexAll(async, entityManager);
    }
}