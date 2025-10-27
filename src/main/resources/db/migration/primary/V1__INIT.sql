create table application_user (
        profile_picture blob,
        version integer not null,
        hashed_password varchar(255),
        id varchar(255) not null,
        name varchar(255),
        username varchar(255),
        primary key (id)
);

create table comment (
    created_at timestamp,
    updated_at timestamp,
    comments_id varchar(255),
    content varchar(255),
    id varchar(255) not null,
    post_id varchar(255),
    primary key (id)
);

create table event_publication (
    completion_date timestamp,
    publication_date timestamp,
    event_type varchar(255),
    id blob not null,
    listener_id varchar(255),
    serialized_event varchar(255),
    primary key (id)
);


create table post (
    created_at timestamp,
    updated_at timestamp,
    content varchar(255),
    cover_resource_id varchar(255),
    id varchar(255) not null,
    title varchar(255),
    post_status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    note_type VARCHAR(50) NOT NULL DEFAULT 'MEDIA',
    primary key (id)
);

create table post_tag (
    post_id varchar(255) not null,
    tag_id varchar(255) not null,
    primary key (post_id, tag_id)
);

create table tag (
    created_at timestamp,
    updated_at timestamp,
    id varchar(255) not null,
    name varchar(255),
    primary key (id)
);

create table user_roles (
    roles varchar(255) check (roles in ('USER','ADMIN')),
    user_id varchar(255) not null
);