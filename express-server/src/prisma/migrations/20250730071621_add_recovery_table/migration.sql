/*
  Warnings:

  - A unique constraint covering the columns `[recoveryKeyId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `recoveryKeyId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `recoveryKeyId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `UserRecoveryKey` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encryptedPrivateKey` JSON NOT NULL,
    `encryptedPassphrase` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_recoveryKeyId_key` ON `User`(`recoveryKeyId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_recoveryKeyId_fkey` FOREIGN KEY (`recoveryKeyId`) REFERENCES `UserRecoveryKey`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
