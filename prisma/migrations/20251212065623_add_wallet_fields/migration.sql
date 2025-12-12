-- AlterTable
ALTER TABLE `memberprofile` ADD COLUMN `expiredPoints` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `pendingPoints` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `pointsExpiryDate` DATETIME(3) NULL;
