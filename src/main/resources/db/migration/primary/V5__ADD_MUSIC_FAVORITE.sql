CREATE TABLE music_favorite (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    song_id VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    artist VARCHAR(1000),
    album VARCHAR(255),
    pic_id VARCHAR(255),
    lyric_id VARCHAR(255),
    added_at TIMESTAMP NOT NULL,
    UNIQUE(song_id, source)
);

CREATE INDEX idx_music_favorite_added_at ON music_favorite(added_at DESC);

