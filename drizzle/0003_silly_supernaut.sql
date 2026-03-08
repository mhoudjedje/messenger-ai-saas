CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` enum('stripe','chargily') NOT NULL,
	`providerPaymentId` varchar(255) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`planType` enum('pro','enterprise') NOT NULL,
	`planDuration` enum('monthly','yearly') NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_providerPaymentId_unique` UNIQUE(`providerPaymentId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` enum('free','pro','enterprise') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionPlan` enum('monthly','yearly');--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `paymentProvider` enum('stripe','chargily');--> statement-breakpoint
ALTER TABLE `users` ADD `paymentCustomerId` varchar(255);