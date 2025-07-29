/*
  Warnings:

  - You are about to alter the column `encryptedPayload` on the `Message` table. The data in that column could be lost. The data in that column will be cast from `LongBlob` to `VarChar(191)`.
  - You are about to alter the column `encryptedKey` on the `MessageKey` table. The data in that column could be lost. The data in that column will be cast from `LongBlob` to `VarChar(191)`.
  - You are about to alter the column `publicKey` on the `User` table. The data in that column could be lost. The data in that column will be cast from `LongBlob` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Message` MODIFY `encryptedPayload` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `MessageKey` MODIFY `encryptedKey` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `publicKey` VARCHAR(191) NOT NULL;
