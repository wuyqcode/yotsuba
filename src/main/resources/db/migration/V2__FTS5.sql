CREATE VIRTUAL TABLE fts5_post USING fts5(id UNINDEXED, title, content, content='post', tokenize='trigram');
CREATE VIRTUAL TABLE fts5_post_vocab USING fts5vocab( fts5_post , row );

CREATE TRIGGER post_before_update
BEFORE UPDATE ON post BEGIN
    DELETE FROM fts5_post WHERE id=old.id;
END;

CREATE TRIGGER post_before_delete
BEFORE DELETE ON post BEGIN
    DELETE FROM fts5_post WHERE id=old.id;
END;

CREATE TRIGGER post_after_update
AFTER UPDATE ON post BEGIN
    INSERT INTO fts5_post(id, title, content)
    SELECT id, title, content
    FROM post
    WHERE new.id = post.id;
END;

CREATE TRIGGER post_after_insert
AFTER INSERT ON post BEGIN
    INSERT INTO fts5_post(id, title, content)
    SELECT id, title, content
    FROM post
    WHERE new.id = post.id;
END;

INSERT INTO fts5_post(id, title, content) SELECT id, title, content FROM post;
INSERT INTO fts5_post(fts5_post) VALUES('rebuild');