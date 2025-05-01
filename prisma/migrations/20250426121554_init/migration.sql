-- CreateTable
CREATE TABLE `booking` (
    `bookingID` INTEGER NOT NULL DEFAULT 1,
    `userID` INTEGER NOT NULL,
    `startDate` DATETIME(0) NOT NULL,
    `endDate` DATETIME(0) NOT NULL,
    `price` INTEGER NOT NULL,

    UNIQUE INDEX `bookingID_UNIQUE`(`bookingID`),
    INDEX `fk_booking_userID_idx`(`userID`),
    PRIMARY KEY (`bookingID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campingSpot` (
    `spotID` INTEGER NOT NULL,
    `userID` INTEGER NOT NULL,
    `name` VARCHAR(45) NOT NULL,
    `description` VARCHAR(45) NULL,
    `price` INTEGER NOT NULL,
    `countryID` INTEGER NOT NULL,
    `cityID` INTEGER NOT NULL,

    UNIQUE INDEX `spotID_UNIQUE`(`spotID`),
    INDEX `fk_campingSpot_CountryID_idx`(`countryID`),
    INDEX `fk_campingSpot_cityID_idx`(`cityID`),
    INDEX `fk_campingSpot_userID_idx`(`userID`),
    PRIMARY KEY (`spotID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campingSpot_bookings` (
    `spotID` INTEGER NOT NULL,
    `bookingID` INTEGER NOT NULL,

    INDEX `fk_campingSpot_bookings_bookingID_idx`(`bookingID`),
    INDEX `fk_campingSpot_bookings_spotID_idx`(`spotID`),
    PRIMARY KEY (`spotID`, `bookingID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campingSpot_features` (
    `spotID` INTEGER NOT NULL,
    `featureID` INTEGER NOT NULL,

    INDEX `fk_campingSpot_features_featrureID_idx`(`featureID`),
    INDEX `fk_campingSpot_features_spotID_idx`(`spotID`),
    PRIMARY KEY (`spotID`, `featureID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `city` (
    `cityID` INTEGER NOT NULL,
    `cityName` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`cityID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `country` (
    `countryID` INTEGER NOT NULL,
    `countryName` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`countryID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feature` (
    `featureID` INTEGER NOT NULL,
    `featureName` VARCHAR(45) NOT NULL,

    UNIQUE INDEX `featureID_UNIQUE`(`featureID`),
    PRIMARY KEY (`featureID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review` (
    `reviewID` INTEGER NOT NULL,
    `bookingID` INTEGER NOT NULL,
    `spotID` INTEGER NOT NULL,
    `rating` INTEGER NULL,
    `comment` VARCHAR(45) NULL,

    UNIQUE INDEX `reviewID_UNIQUE`(`reviewID`),
    INDEX `fk_review_bookingID_idx`(`bookingID`),
    INDEX `fk_review_spotID_idx`(`spotID`),
    PRIMARY KEY (`reviewID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `userID` INTEGER NOT NULL,
    `username` VARCHAR(16) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(32) NOT NULL,
    `createDate` DATETIME(0) NOT NULL,
    `isAdmin` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`userID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `fk_booking_userID` FOREIGN KEY (`userID`) REFERENCES `user`(`userID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `campingSpot` ADD CONSTRAINT `fk_campingSpot_cityID` FOREIGN KEY (`cityID`) REFERENCES `city`(`cityID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `campingSpot` ADD CONSTRAINT `fk_campingSpot_countryID` FOREIGN KEY (`countryID`) REFERENCES `country`(`countryID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `campingSpot` ADD CONSTRAINT `fk_campingSpot_userID` FOREIGN KEY (`userID`) REFERENCES `user`(`userID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `campingSpot_bookings` ADD CONSTRAINT `fk_campingSpot_bookings_bookingID` FOREIGN KEY (`bookingID`) REFERENCES `booking`(`bookingID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `campingSpot_bookings` ADD CONSTRAINT `fk_campingSpot_bookings_spotID` FOREIGN KEY (`spotID`) REFERENCES `campingSpot`(`spotID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `campingSpot_features` ADD CONSTRAINT `fk_campingSpot_features_featrureID` FOREIGN KEY (`featureID`) REFERENCES `feature`(`featureID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `campingSpot_features` ADD CONSTRAINT `fk_campingSpot_features_spotID` FOREIGN KEY (`spotID`) REFERENCES `campingSpot`(`spotID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `fk_review_bookingID` FOREIGN KEY (`bookingID`) REFERENCES `booking`(`bookingID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `fk_review_spotID` FOREIGN KEY (`spotID`) REFERENCES `campingSpot`(`spotID`) ON DELETE NO ACTION ON UPDATE NO ACTION;
