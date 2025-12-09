ALTER TABLE file_resource RENAME COLUMN size TO file_size;
ALTER TABLE file_resource ADD resource_type VARCHAR(50) NOT NULL DEFAULT 'DATABASE';
ALTER TABLE file_resource ADD encrypted BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE file_resource ADD password_hash VARCHAR(255) NULL;
