CREATE TABLE `api_keys_table` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`owner` text NOT NULL,
	`calls` integer DEFAULT 0 NOT NULL
);
