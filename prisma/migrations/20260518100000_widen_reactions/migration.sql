-- Widen ReactionType from binary (LIKE/DISLIKE) to the 5-emoji brand set.
-- Drops denormalized likes/dislikes counters on Review; counts are computed via
-- groupBy in the reactions service.

-- 1) Rename old enum so we can build the new one with the same name.
ALTER TYPE "ReactionType" RENAME TO "ReactionType_old";

-- 2) Create the new enum.
CREATE TYPE "ReactionType" AS ENUM ('REAL_TEA', 'CAP', 'HOT_TAKE', 'HELPFUL', 'TOO_REAL');

-- 3) Re-type the Reaction.type column, remapping legacy values:
--      LIKE    -> REAL_TEA
--      DISLIKE -> CAP
ALTER TABLE "Reaction"
  ALTER COLUMN "type" TYPE "ReactionType"
  USING (
    CASE "type"::text
      WHEN 'LIKE'    THEN 'REAL_TEA'::"ReactionType"
      WHEN 'DISLIKE' THEN 'CAP'::"ReactionType"
    END
  );

-- 4) Drop the old enum now that nothing references it.
DROP TYPE "ReactionType_old";

-- 5) Drop denormalized counters; reactionCounts is computed live.
ALTER TABLE "Review" DROP COLUMN "likes";
ALTER TABLE "Review" DROP COLUMN "dislikes";

-- 6) Add an index for the per-review per-type aggregation hot path.
CREATE INDEX "Reaction_reviewId_type_idx" ON "Reaction"("reviewId", "type");
