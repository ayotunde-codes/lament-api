-- CreateEnum
CREATE TYPE "Tenure" AS ENUM ('LT_1Y', 'ONE_TO_TWO_Y', 'THREE_TO_FIVE_Y', 'FIVE_PLUS_Y', 'INTERVIEW');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ENGINEERING', 'DESIGN', 'PRODUCT', 'SALES', 'MARKETING', 'OPS', 'HR', 'FINANCE', 'CUSTOMER_SUPPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('CURRENT', 'FORMER', 'INTERVIEWED');

-- AlterTable
ALTER TABLE "Review"
  ADD COLUMN "tenure" "Tenure",
  ADD COLUMN "role" "Role",
  ADD COLUMN "status" "EmploymentStatus";
