-- AlterTable
ALTER TABLE `Message` MODIFY `hashContent` TEXT NOT NULL,
    MODIFY `encryptedPayload` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `MessageKey` MODIFY `encryptedKey` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `publicKey` TEXT NOT NULL;
