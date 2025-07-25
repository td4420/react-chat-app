/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Room` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Room` DROP FOREIGN KEY `Room_ownerId_fkey`;

-- AlterTable
ALTER TABLE `Room` DROP COLUMN `ownerId`,
    ADD COLUMN `avatar` VARCHAR(191) NOT NULL DEFAULT 'https://chatscope.io/storybook/react/assets/zoe-E7ZdmXF0.svg';

-- AlterTable
ALTER TABLE `RoomMember` ADD COLUMN `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE `User` ADD COLUMN `avatar` VARCHAR(191) NOT NULL DEFAULT 'https://chatscope.io/storybook/react/assets/zoe-E7ZdmXF0.svg';
