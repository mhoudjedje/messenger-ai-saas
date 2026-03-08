import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json, longtext } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) for backward compatibility */
  openId: varchar("openId", { length: 64 }).unique(),
  /** Phone number for OTP authentication (Algérie) */
  phone: varchar("phone", { length: 20 }).unique(),
  /** Email address */
  email: varchar("email", { length: 320 }).unique(),
  /** Password hash (for email/phone signup) */
  passwordHash: varchar("passwordHash", { length: 255 }),
  /** Authentication provider: 'email', 'phone', 'google', 'manus' */
  provider: mysqlEnum("provider", ["email", "phone", "google", "manus"]).notNull(),
  name: text("name"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  /** Subscription status: free, pro, enterprise */
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["free", "pro", "enterprise"]).default("free").notNull(),
  /** Subscription plan: monthly, yearly */
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["monthly", "yearly"]),
  /** Subscription expiration date */
  subscriptionExpiresAt: timestamp("subscriptionExpiresAt"),
  /** Payment provider: stripe, chargily */
  paymentProvider: mysqlEnum("paymentProvider", ["stripe", "chargily"]),
  /** Customer ID from payment provider */
  paymentCustomerId: varchar("paymentCustomerId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Messenger Pages - Pages Facebook connectées
export const messengerPages = mysqlTable("messenger_pages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  pageId: varchar("pageId", { length: 64 }).notNull().unique(),
  pageName: text("pageName"),
  pageAccessToken: text("pageAccessToken").notNull(), // Encrypted in production
  isActive: boolean("isActive").default(true).notNull(),
  connectedAt: timestamp("connectedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MessengerPage = typeof messengerPages.$inferSelect;
export type InsertMessengerPage = typeof messengerPages.$inferInsert;

// Agent Configurations - Configuration de l'agent IA par utilisateur
export const agentConfigs = mysqlTable("agent_configs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  pageId: varchar("pageId", { length: 64 }).notNull(),
  agentName: varchar("agentName", { length: 255 }).default("AI Agent").notNull(),
  personality: text("personality"), // Description de la personnalité de l'agent
  systemPrompt: longtext("systemPrompt"), // Instructions système pour OpenAI
  responseLanguage: varchar("responseLanguage", { length: 10 }).default("ar").notNull(), // ar, fr, en
  responseRules: json("responseRules"), // Règles de réponse personnalisées
  maxTokens: int("maxTokens").default(500).notNull(),
  temperature: decimal("temperature", { precision: 3, scale: 2 }).default("0.7").notNull(),
  isEnabled: boolean("isEnabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentConfig = typeof agentConfigs.$inferSelect;
export type InsertAgentConfig = typeof agentConfigs.$inferInsert;

// Conversations - Historique des conversations
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  pageId: varchar("pageId", { length: 64 }).notNull(),
  psid: varchar("psid", { length: 64 }).notNull(), // Page-scoped user ID from Messenger
  senderName: text("senderName"),
  senderLanguage: varchar("senderLanguage", { length: 10 }).default("ar"),
  messageCount: int("messageCount").default(0).notNull(),
  avgResponseTime: int("avgResponseTime").default(0).notNull(), // in milliseconds
  lastMessageAt: timestamp("lastMessageAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

// Messages - Messages individuels dans les conversations
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  userId: int("userId").notNull(),
  pageId: varchar("pageId", { length: 64 }).notNull(),
  psid: varchar("psid", { length: 64 }).notNull(),
  messageId: varchar("messageId", { length: 255 }).notNull().unique(),
  senderType: mysqlEnum("senderType", ["user", "agent"]).notNull(),
  content: longtext("content").notNull(),
  contentType: varchar("contentType", { length: 50 }).default("text").notNull(), // text, image, video, file, etc.
  mediaUrl: text("mediaUrl"), // URL du fichier média si applicable
  language: varchar("language", { length: 10 }).default("ar"),
  responseTime: int("responseTime"), // Time taken to generate response (ms)
  isProcessed: boolean("isProcessed").default(true).notNull(),
  errorMessage: text("errorMessage"), // If processing failed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Subscriptions - Gestion des abonnements Stripe
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).notNull().unique(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).unique(),
  planType: mysqlEnum("planType", ["free", "pro", "enterprise"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "trialing", "past_due", "canceled", "incomplete", "incomplete_expired"]).default("incomplete").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  trialStart: timestamp("trialStart"),
  trialEnd: timestamp("trialEnd"),
  canceledAt: timestamp("canceledAt"),
  messagesUsed: int("messagesUsed").default(0).notNull(),
  messagesLimit: int("messagesLimit").default(1000).notNull(), // Per month
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// OTP Verification - Stockage temporaire des codes OTP
export const otpVerifications = mysqlTable("otp_verifications", {
  id: int("id").autoincrement().primaryKey(),
  phoneOrEmail: varchar("phoneOrEmail", { length: 320 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  type: mysqlEnum("type", ["phone", "email"]).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  attempts: int("attempts").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = typeof otpVerifications.$inferInsert;

// Payments - Historique des paiements (Stripe + Chargily)
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: mysqlEnum("provider", ["stripe", "chargily"]).notNull(),
  providerPaymentId: varchar("providerPaymentId", { length: 255 }).notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  planType: mysqlEnum("planType", ["pro", "enterprise"]).notNull(),
  planDuration: mysqlEnum("planDuration", ["monthly", "yearly"]).notNull(),
  metadata: json("metadata"), // Additional data from payment provider
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// User Preferences - Préférences utilisateur
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  preferredLanguage: varchar("preferredLanguage", { length: 10 }).default("ar").notNull(), // ar, fr, en
  timezone: varchar("timezone", { length: 50 }).default("Africa/Algiers").notNull(),
  emailNotifications: boolean("emailNotifications").default(true).notNull(),
  notificationEmail: varchar("notificationEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  messengerPages: many(messengerPages),
  agentConfigs: many(agentConfigs),
  conversations: many(conversations),
  subscriptions: many(subscriptions),
  payments: many(payments),
  preferences: one(userPreferences),
}));

export const messengerPagesRelations = relations(messengerPages, ({ one, many }) => ({
  user: one(users, { fields: [messengerPages.userId], references: [users.id] }),
  agentConfigs: many(agentConfigs),
  conversations: many(conversations),
}));

export const agentConfigsRelations = relations(agentConfigs, ({ one }) => ({
  user: one(users, { fields: [agentConfigs.userId], references: [users.id] }),
  page: one(messengerPages, { fields: [agentConfigs.pageId], references: [messengerPages.pageId] }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, { fields: [conversations.userId], references: [users.id] }),
  page: one(messengerPages, { fields: [conversations.pageId], references: [messengerPages.pageId] }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, { fields: [messages.userId], references: [users.id] }),
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, { fields: [userPreferences.userId], references: [users.id] }),
}));
