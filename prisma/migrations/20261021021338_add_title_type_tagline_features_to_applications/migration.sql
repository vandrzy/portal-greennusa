/*
  Warnings:

  - You are about to drop the `apps` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `apps`;

-- CreateTable
CREATE TABLE `applications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(120) NOT NULL,
    `title` VARCHAR(255) NOT NULL DEFAULT '',
    `name` VARCHAR(150) NOT NULL,
    `jenis_aplikasi` VARCHAR(150) NOT NULL DEFAULT '',
    `tagline` VARCHAR(255) NOT NULL DEFAULT '',
    `keunggulan` JSON NOT NULL,
    `category` ENUM('pemerintahan', 'swasta') NOT NULL,
    `description` TEXT NOT NULL,
    `icon_url` VARCHAR(500) NOT NULL,
    `app_image` VARCHAR(500) NULL,
    `url` VARCHAR(500) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `applications_slug_key`(`slug`),
    INDEX `applications_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
