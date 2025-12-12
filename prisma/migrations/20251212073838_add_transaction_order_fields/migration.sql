-- AlterTable
ALTER TABLE `loyaltytransaction` ADD COLUMN `cashbackUsed` DOUBLE NOT NULL DEFAULT 0.0,
    ADD COLUMN `orderId` VARCHAR(191) NULL,
    ADD COLUMN `source` VARCHAR(191) NULL;
