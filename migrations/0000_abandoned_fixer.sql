CREATE TABLE `ReviewedItems` (
	`id` integer PRIMARY KEY NOT NULL,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`reviewerID` integer NOT NULL,
	`reviewURL` text NOT NULL,
	`name` text NOT NULL,
	`creator` text NOT NULL,
	`service` text DEFAULT ('spotify') NOT NULL,
	`resolvable` integer DEFAULT 1 NOT NULL,
	`metadata` blob
);

CREATE TABLE `Reviewers` (
	`id` integer PRIMARY KEY NOT NULL,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`service` text DEFAULT ('publication'),
	`metadata` blob
);

CREATE TABLE `SpotifyGenres` (
	`id` integer PRIMARY KEY NOT NULL,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`slug` text NOT NULL
);

CREATE UNIQUE INDEX `uq_AlbumsReviewedByPublicationReviewURL` ON `ReviewedItems` (`reviewerID`,`reviewURL`);
CREATE UNIQUE INDEX `uq_PublicationSlug` ON `Reviewers` (`slug`);
CREATE UNIQUE INDEX `uq_SpotifyGenreSlug` ON `SpotifyGenres` (`slug`);