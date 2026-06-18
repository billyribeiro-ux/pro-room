-- Singleton application branding: the admin-editable brand name and logo. The
-- logo bytes live on local disk under the uploads dir (like every other upload);
-- this row holds only the storage key + content type. `id boolean PRIMARY KEY
-- DEFAULT true CHECK (id)` enforces exactly one row: any insert must use id=true
-- and the primary key forbids a second. Reads always find this row and fall back
-- to the bundled defaults for any NULL column.
CREATE TABLE branding (
    id boolean PRIMARY KEY DEFAULT true,
    name text,
    logo_storage_name text,
    logo_content_type text,
    updated_by uuid REFERENCES users (id) ON DELETE SET NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT branding_singleton CHECK (id)
);

-- Seed the single row empty so GET /api/branding always returns a row (NULLs ⇒
-- the frontend uses its bundled default logo + name).
INSERT INTO branding (id) VALUES (true);
