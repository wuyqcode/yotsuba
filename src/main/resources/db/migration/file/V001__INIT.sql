create table file_resource (
    data blob,
    reference_type tinyint check (reference_type between 0 and 1),
    created_at timestamp,
    size bigint,
    updated_at timestamp,
    filename varchar(255),
    id varchar(255) not null,
    reference_id varchar(255),
    primary key (id)
);
