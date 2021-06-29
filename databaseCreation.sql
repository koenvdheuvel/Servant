CREATE DATABASE IF NOT EXISTS `servant`;
USE `servant`;

DROP TABLE IF EXISTS `ActionLog`;
CREATE TABLE `ActionLog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `serverId` int(11) NOT NULL,
  `userId` varchar(255) DEFAULT NULL,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `action` int(11) DEFAULT NULL,
  `channelId` varchar(255) DEFAULT NULL,
  `data` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ServerSettings`;
CREATE TABLE `ServerSettings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `guildId` varchar(255) NOT NULL,
  `deleted` datetime DEFAULT NULL,
  `prefix` varchar(2) NOT NULL,
  `logChannel` varchar(255) DEFAULT NULL,
  `voiceActivityLogChannel` varchar(255) DEFAULT NULL,
  `modLogChannel` varchar(255) DEFAULT NULL,
  `systemNotice` tinyint(1) NOT NULL,
  `streamLiveRole` varchar(255) DEFAULT NULL,
  `streamShout` varchar(255) DEFAULT NULL,
  `streamTimeout` int(11) DEFAULT NULL,
  `adminRole` varchar(255) DEFAULT NULL,
  `moderatorRole` varchar(255) DEFAULT NULL,
  `muteRole` varchar(255) DEFAULT NULL,
  `muteChannel` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `WhiteListedGames`;
CREATE TABLE `WhiteListedGames` (
  `guildId` VARCHAR(255) NOT NULL,
  `id` VARCHAR(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`guildId`, `name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `WhiteListedRoles`;
CREATE TABLE `WhiteListedRoles` (
  `guildId` VARCHAR(255) NOT NULL,
  `id` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`guildId`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `Muted`;
CREATE TABLE `Muted` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `guildId` VARCHAR(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `byUserId` varchar(255) DEFAULT NULL,
  `start` datetime NOT NULL,
  `until` datetime NOT NULL,
  `end` datetime DEFAULT NULL,
  `reason` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `SquirrelLog`;
CREATE TABLE `SquirrelLog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `guildId` VARCHAR(255) NOT NULL,
  `channelId` VARCHAR(255) NOT NULL,
  `date` datetime NOT NULL,
  `squirrelHash` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;