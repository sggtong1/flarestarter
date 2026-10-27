CREATE TABLE `shop_order` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`kind` text NOT NULL,
	`quantity` integer NOT NULL,
	`frequency_months` integer,
	`pack_size` integer,
	`currency` text NOT NULL,
	`total_cents` integer NOT NULL,
	`summary` text NOT NULL,
	`stripe_checkout_session_id` text,
	`stripe_payment_intent_id` text,
	`stripe_subscription_id` text,
	`stripe_customer_id` text,
	`confirmation_sent_at` integer,
	`created_at` integer NOT NULL,
	`paid_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `shop_order_user_idx` ON `shop_order` (`user_id`);--> statement-breakpoint
CREATE INDEX `shop_order_session_idx` ON `shop_order` (`stripe_checkout_session_id`);--> statement-breakpoint
CREATE INDEX `shop_order_pi_idx` ON `shop_order` (`stripe_payment_intent_id`);--> statement-breakpoint
CREATE TABLE `shop_subscription` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`order_id` text,
	`stripe_subscription_id` text NOT NULL,
	`stripe_customer_id` text NOT NULL,
	`status` text NOT NULL,
	`frequency_months` integer NOT NULL,
	`quantity` integer NOT NULL,
	`cancel_at_period_end` integer DEFAULT false NOT NULL,
	`current_period_end` integer,
	`pause_resumes_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shop_subscription_stripe_subscription_id_unique` ON `shop_subscription` (`stripe_subscription_id`);--> statement-breakpoint
CREATE INDEX `shop_sub_user_idx` ON `shop_subscription` (`user_id`);