-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ElementType" ADD VALUE 'electric';
ALTER TYPE "ElementType" ADD VALUE 'ice';
ALTER TYPE "ElementType" ADD VALUE 'grass';
ALTER TYPE "ElementType" ADD VALUE 'metal';
ALTER TYPE "ElementType" ADD VALUE 'ghost';
ALTER TYPE "ElementType" ADD VALUE 'poison';
ALTER TYPE "ElementType" ADD VALUE 'psychic';
ALTER TYPE "ElementType" ADD VALUE 'rainbow';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RarityType" ADD VALUE 'mythic';
ALTER TYPE "RarityType" ADD VALUE 'unique';

-- AlterTable
ALTER TABLE "pixegotchis" ADD COLUMN     "cleanliness_rate" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
ADD COLUMN     "happines_rate" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
ADD COLUMN     "life_recovery_rate" DECIMAL(3,2) NOT NULL DEFAULT 1.0;

-- DropEnum
DROP TYPE "ItemEffect";
