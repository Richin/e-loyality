-- AlterTable
ALTER TABLE `memberprofile` ADD COLUMN `currentStreak` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `lastVisitDate` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `Challenge` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `goal` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `pointsReward` INTEGER NOT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserChallenge` (
    `id` VARCHAR(191) NOT NULL,
    `memberProfileId` VARCHAR(191) NOT NULL,
    `challengeId` VARCHAR(191) NOT NULL,
    `progress` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `completedAt` DATETIME(3) NULL,

    UNIQUE INDEX `UserChallenge_memberProfileId_challengeId_key`(`memberProfileId`, `challengeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserChallenge` ADD CONSTRAINT `UserChallenge_memberProfileId_fkey` FOREIGN KEY (`memberProfileId`) REFERENCES `MemberProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserChallenge` ADD CONSTRAINT `UserChallenge_challengeId_fkey` FOREIGN KEY (`challengeId`) REFERENCES `Challenge`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
