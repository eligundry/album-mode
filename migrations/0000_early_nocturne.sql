CREATE TABLE `ReviewedItems` (
	`id` integer PRIMARY KEY NOT NULL,
	`createdAt` integer DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL,
	`reviewerID` integer NOT NULL,
	`list` text,
	`reviewURL` text NOT NULL,
	`name` text NOT NULL,
	`creator` text NOT NULL,
	`service` text DEFAULT 'spotify' NOT NULL,
	`score` integer,
	`resolvable` integer DEFAULT 1 NOT NULL,
	`metadata` blob
);
--> statement-breakpoint
CREATE TABLE `Reviewers` (
	`id` integer PRIMARY KEY NOT NULL,
	`createdAt` integer DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`service` text DEFAULT 'publication',
	`metadata` blob
);
--> statement-breakpoint
CREATE TABLE `SavedItems` (
	`id` integer PRIMARY KEY NOT NULL,
	`createdAt` integer DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL,
	`deletedAt` integer,
	`user` text NOT NULL,
	`type` text,
	`identifier` text NOT NULL,
	`metadata` blob
);
--> statement-breakpoint
CREATE TABLE `SpotifyGenres` (
	`id` integer PRIMARY KEY NOT NULL,
	`createdAt` integer DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_AlbumsReviewedByPublicationReviewURLAndList` ON `ReviewedItems` (`reviewerID`,coalesce(`list`, 'NA'),`reviewURL`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_PublicationSlug` ON `Reviewers` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_SavedItemsIdentifier` ON `SavedItems` (`user`,`identifier`,`type`,coalesce(`deletedAt`, 0));--> statement-breakpoint
CREATE UNIQUE INDEX `uq_SpotifyGenreName` ON `SpotifyGenres` (`name`);
--> statement-breakpoint
CREATE TRIGGER `trg_ReviewedItemsUpdatedAt`
AFTER UPDATE ON `ReviewedItems`
FOR EACH ROW
BEGIN
    UPDATE `ReviewedItems` SET updatedAt = (cast(strftime('%s', 'now') as int)) WHERE id = OLD.id;
END;
--> statement-breakpoint
CREATE TRIGGER `trg_ReviewersUpdatedAt`
AFTER UPDATE ON `Reviewers`
FOR EACH ROW
BEGIN
    UPDATE `Reviewers` SET updatedAt = (cast(strftime('%s', 'now') as int)) WHERE id = OLD.id;
END;
--> statement-breakpoint
CREATE TRIGGER `trg_SpotifyGenresUpdatedAt`
AFTER UPDATE ON `SpotifyGenres`
FOR EACH ROW
BEGIN
    UPDATE `SpotifyGenres` SET updatedAt = (cast(strftime('%s', 'now') as int)) WHERE id = OLD.id;
END;
--> statement-breakpoint
CREATE TRIGGER `trg_SavedItems`
AFTER UPDATE ON `SavedItems`
FOR EACH ROW
BEGIN
    UPDATE `SavedItems` SET updatedAt = (cast(strftime('%s', 'now') as int)) WHERE id = OLD.id;
END;
