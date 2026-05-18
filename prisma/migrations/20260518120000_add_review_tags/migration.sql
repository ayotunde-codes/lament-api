-- Add locked-vocabulary tags to reviews.
-- Stored as a native Postgres TEXT[] array (no join table needed for a small,
-- bounded vocabulary). Filtering uses the @> (contains) operator which is
-- supported by a GIN index for fast lookups at scale.

ALTER TABLE "Review"
  ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT '{}';

-- GIN index so WHERE "tags" @> ARRAY['Compensation'] is fast.
CREATE INDEX "Review_tags_idx" ON "Review" USING GIN ("tags");
