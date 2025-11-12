CREATE TABLE application_user (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    profile_picture BLOB,
    version INTEGER not null,
    hashed_password VARCHAR(255),
    name VARCHAR(255),
    username VARCHAR(255)
);

CREATE TABLE user_roles (
    user_id VARCHAR(255) NOT NULL,
    roles VARCHAR(255) CHECK (roles IN ('USER','ADMIN'))
);

CREATE TABLE event_publication (
    id BLOB NOT NULL PRIMARY KEY,
    event_type VARCHAR(255),
    listener_id VARCHAR(255),
    serialized_event varchar(255),
    completion_date TIMESTAMP,
    publication_date TIMESTAMP
);

CREATE TABLE collection (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

INSERT INTO collection (id, name, created_at, updated_at)
VALUES ('ALL', '全部笔记', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO collection (id, name, created_at, updated_at)
VALUES ('DELETED', '回收站', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

CREATE TABLE note (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    title VARCHAR(255),
    content VARCHAR(255),
    cover_resource_id VARCHAR(255),
    collection_id VARCHAR(255) NOT NULL default 'ALL',
    note_type VARCHAR(50) NOT NULL DEFAULT 'WIKI',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE media_note (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    release_year INTEGER,
    rating REAL,
    overview TEXT,
    seasons_json TEXT
);

CREATE TABLE tag (
    id varchar(255) NOT NULL PRIMARY KEY,
    name varchar(255) NOT NULL UNIQUE,
    collection_id VARCHAR(255) NOT NULL default 'ALL',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE note_tag (
    note_id VARCHAR(255) NOT NULL,
    tag_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (note_id, tag_id)
);

CREATE TABLE comment (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    note_id VARCHAR(255) NOT NULL,
    content VARCHAR(255) NOT NULL DEFAULT '',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);


CREATE TABLE tag_graph_edge (
    source_tag_id   VARCHAR(255) NOT NULL,
    target_tag_id   VARCHAR(255) NOT NULL,
    collection_id   VARCHAR(255) NOT NULL default 'ALL',
    weight          INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (source_tag_id, target_tag_id, collection_id)
);
