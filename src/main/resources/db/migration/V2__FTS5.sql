CREATE VIRTUAL TABLE fts5_post USING fts5(id UNINDEXED, title, content, tokenize='trigram');
CREATE VIRTUAL TABLE fts5_post_vocab USING fts5vocab( fts5_post , row );

---- Triggers to keep the FTS index up to date.
--CREATE TRIGGER fts5_post_ai AFTER INSERT ON post BEGIN
--    INSERT INTO fts5_post(id, title, content) VALUES (new.id, new.title, new.content);
--END;
--CREATE TRIGGER fts5_post_ad AFTER DELETE ON post BEGIN
--  INSERT INTO fts5_post(fts5_post, id, title, content) VALUES('delete', old.id, old.title, old.content);
--END;
--CREATE TRIGGER fts5_post_au AFTER UPDATE ON post BEGIN
--  INSERT INTO fts5_post(fts5_post, id, title, content) VALUES('delete', old.id, old.title, old.content);
--    INSERT INTO fts5_post(id, title, content) VALUES (new.id, new.title, new.content);
--END;