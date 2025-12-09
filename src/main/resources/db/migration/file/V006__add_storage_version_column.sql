ALTER TABLE file_resource
    ADD COLUMN storage_version VARCHAR(50) DEFAULT 'V1';

UPDATE file_resource
SET storage_version = 'V1'
WHERE storage_version IS NULL;

