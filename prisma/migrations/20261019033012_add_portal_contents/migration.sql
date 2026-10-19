-- CreateTable
CREATE TABLE `portal_contents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `logo_url` VARCHAR(191) NOT NULL DEFAULT '/assets/logo/logo-green.png',
    `header_text` VARCHAR(191) NOT NULL,
    `paragraph_text` TEXT NOT NULL,
    `folder1_title` VARCHAR(191) NOT NULL,
    `folder1_subtitle` VARCHAR(191) NOT NULL,
    `folder2_title` VARCHAR(191) NOT NULL,
    `folder2_subtitle` VARCHAR(191) NOT NULL,
    `whatsapp_link` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
