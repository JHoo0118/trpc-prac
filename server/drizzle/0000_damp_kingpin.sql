CREATE TABLE `user_follows` (
	`follower_id` integer NOT NULL,
	`following_id` integer NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`follower_id`, `following_id`),
	FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`following_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`bio` text,
	`avatarUrl` text,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `comment_likes` (
	`comment_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`comment_id`, `user_id`),
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `comment_likes_comment_id_idx` ON `comment_likes` (`comment_id`);--> statement-breakpoint
CREATE INDEX `comment_likes_user_id_idx` ON `comment_likes` (`user_id`);--> statement-breakpoint
CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`experience_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`experience_id`) REFERENCES `experiences`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `comments_experience_id_idx` ON `comments` (`experience_id`);--> statement-breakpoint
CREATE TABLE `experience_attendees` (
	`experience_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`experience_id`, `user_id`),
	FOREIGN KEY (`experience_id`) REFERENCES `experiences`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `experience_attendees_experience_id_idx` ON `experience_attendees` (`experience_id`);--> statement-breakpoint
CREATE INDEX `experience_attendees_user_id_idx` ON `experience_attendees` (`user_id`);--> statement-breakpoint
CREATE TABLE `experience_favorites` (
	`experience_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`experience_id`, `user_id`),
	FOREIGN KEY (`experience_id`) REFERENCES `experiences`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `experience_favorites_experience_id_idx` ON `experience_favorites` (`experience_id`);--> statement-breakpoint
CREATE INDEX `experience_favorites_user_id_idx` ON `experience_favorites` (`user_id`);--> statement-breakpoint
CREATE TABLE `experience_tags` (
	`experience_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`experience_id`, `tag_id`),
	FOREIGN KEY (`experience_id`) REFERENCES `experiences`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `experience_tags_experience_id_idx` ON `experience_tags` (`experience_id`);--> statement-breakpoint
CREATE INDEX `experience_tags_tag_id_idx` ON `experience_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `experiences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`scheduled_at` text NOT NULL,
	`url` text,
	`image_url` text,
	`location` text,
	`user_id` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `experiences_user_id_idx` ON `experiences` (`user_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`comment_id` integer,
	`experience_id` integer,
	`from_user_id` integer NOT NULL,
	`user_id` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`experience_id`) REFERENCES `experiences`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_experience_id_idx` ON `notifications` (`experience_id`);--> statement-breakpoint
CREATE INDEX `notifications_comment_id_idx` ON `notifications` (`comment_id`);--> statement-breakpoint
CREATE INDEX `notifications_from_user_id_idx` ON `notifications` (`from_user_id`);--> statement-breakpoint
CREATE INDEX `notifications_user_id_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE INDEX `tags_name_idx` ON `tags` (`name`);