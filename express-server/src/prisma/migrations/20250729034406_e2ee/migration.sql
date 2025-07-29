/*
  Warnings:

  - Added the required column `encryptedPayload` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicKey` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Message` ADD COLUMN `encryptedPayload` LONGBLOB NOT NULL;

-- AlterTable
ALTER TABLE `RoomMember` ADD COLUMN `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `User` ADD COLUMN `publicKey` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `MessageKey` (
    `id` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `recipientId` VARCHAR(191) NOT NULL,
    `encryptedKey` LONGBLOB NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MessageKey` ADD CONSTRAINT `MessageKey_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Message`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageKey` ADD CONSTRAINT `MessageKey_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
