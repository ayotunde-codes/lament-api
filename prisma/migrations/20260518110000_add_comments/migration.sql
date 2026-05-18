-- Add single-level Comment threads on reviews.
-- Comments are fully anonymous (username/avatar assigned at post time,
-- same pattern as reviews). No nesting, no editing, no deletion by users.

CREATE TABLE "Comment" (
  "id"          TEXT         NOT NULL,
  "reviewId"    TEXT         NOT NULL,
  "username"    TEXT         NOT NULL,
  "avatar"      TEXT         NOT NULL,
  "avatarColor" TEXT         NOT NULL,
  "body"        TEXT         NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- Foreign key back to Review
ALTER TABLE "Comment"
  ADD CONSTRAINT "Comment_reviewId_fkey"
  FOREIGN KEY ("reviewId") REFERENCES "Review"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Index for efficient per-review listing in chronological order
CREATE INDEX "Comment_reviewId_createdAt_idx" ON "Comment"("reviewId", "createdAt");
