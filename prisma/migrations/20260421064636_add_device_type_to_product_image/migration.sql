-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('PC', 'MOBILE', 'OTHER');

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "deviceType" "DeviceType" NOT NULL DEFAULT 'PC',
ALTER COLUMN "updatedAt" DROP DEFAULT;
