CREATE TABLE `agent_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pageId` varchar(64) NOT NULL,
	`agentName` varchar(255) NOT NULL DEFAULT 'AI Agent',
	`personality` text,
	`systemPrompt` longtext,
	`responseLanguage` varchar(10) NOT NULL DEFAULT 'ar',
	`responseRules` json,
	`maxTokens` int NOT NULL DEFAULT 500,
	`temperature` decimal(3,2) NOT NULL DEFAULT '0.7',
	`isEnabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pageId` varchar(64) NOT NULL,
	`psid` varchar(64) NOT NULL,
	`senderName` text,
	`senderLanguage` varchar(10) DEFAULT 'ar',
	`messageCount` int NOT NULL DEFAULT 0,
	`avgResponseTime` int NOT NULL DEFAULT 0,
	`lastMessageAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`userId` int NOT NULL,
	`pageId` varchar(64) NOT NULL,
	`psid` varchar(64) NOT NULL,
	`messageId` varchar(255) NOT NULL,
	`senderType` enum('user','agent') NOT NULL,
	`content` longtext NOT NULL,
	`contentType` varchar(50) NOT NULL DEFAULT 'text',
	`mediaUrl` text,
	`language` varchar(10) DEFAULT 'ar',
	`responseTime` int,
	`isProcessed` boolean NOT NULL DEFAULT true,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`),
	CONSTRAINT `messages_messageId_unique` UNIQUE(`messageId`)
);
--> statement-breakpoint
CREATE TABLE `messenger_pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pageId` varchar(64) NOT NULL,
	`pageName` text,
	`pageAccessToken` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`connectedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `messenger_pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `messenger_pages_pageId_unique` UNIQUE(`pageId`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeCustomerId` varchar(255) NOT NULL,
	`stripeSubscriptionId` varchar(255),
	`planType` enum('free','pro','enterprise') NOT NULL DEFAULT 'free',
	`status` enum('active','trialing','past_due','canceled','incomplete','incomplete_expired') NOT NULL DEFAULT 'incomplete',
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`trialStart` timestamp,
	`trialEnd` timestamp,
	`canceledAt` timestamp,
	`messagesUsed` int NOT NULL DEFAULT 0,
	`messagesLimit` int NOT NULL DEFAULT 1000,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_stripeCustomerId_unique` UNIQUE(`stripeCustomerId`),
	CONSTRAINT `subscriptions_stripeSubscriptionId_unique` UNIQUE(`stripeSubscriptionId`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`preferredLanguage` varchar(10) NOT NULL DEFAULT 'ar',
	`timezone` varchar(50) NOT NULL DEFAULT 'Africa/Algiers',
	`emailNotifications` boolean NOT NULL DEFAULT true,
	`notificationEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_preferences_userId_unique` UNIQUE(`userId`)
);
