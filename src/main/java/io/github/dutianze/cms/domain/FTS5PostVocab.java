package io.github.dutianze.cms.domain;

import jakarta.persistence.Table;
import org.jmolecules.ddd.types.Entity;

/**
 * @author dutianze
 * @date 2024/9/4
 */
@Table(name = "fts5_post_vocab")
public class FTS5PostVocab implements Entity<Post, FTS5PostVocabId> {

    private FTS5PostVocabId id;

    private String doc;

    private String cnt;

    @Override
    public FTS5PostVocabId getId() {
        return id;
    }

    public void setId(FTS5PostVocabId id) {
        this.id = id;
    }

    public String getTerm() {
        return this.id.term();
    }

    public String getDoc() {
        return doc;
    }

    public void setDoc(String doc) {
        this.doc = doc;
    }

    public String getCnt() {
        return cnt;
    }

    public void setCnt(String cnt) {
        this.cnt = cnt;
    }
}
