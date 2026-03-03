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
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
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

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, { fields: [userPreferences.userId], references: [users.id] }),
}));