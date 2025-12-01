ALTER TABLE collection
ADD COLUMN owner_id VARCHAR(255);

INSERT INTO application_user (id, version, hashed_password, name, username)
VALUES ('SYSTEM_ADMIN', 0, '$2a$12$1vfQXp0uZ6RAxbjyD7plq./MrZZ8SJAF3gE7Ly2l4XtGpkfQmidAK', 'admin', 'admin');

INSERT INTO user_roles (user_id, roles)
VALUES ('SYSTEM_ADMIN', 'ADMIN');

UPDATE collection
SET owner_id = 'SYSTEM_ADMIN';
