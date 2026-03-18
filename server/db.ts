import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, messengerPages, agentConfigs, conversations, messages, subscriptions, userPreferences, MessengerPage, AgentConfig, Conversation, Message, Subscription, UserPreferences } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId && !user.email && !user.phone) {
    throw new Error("User must have openId, email, or phone");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      email: user.email,
      phone: user.phone,
      provider: user.provider || 'manus',
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "passwordHash"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.provider !== undefined) {
      values.provider = user.provider;
      updateSet.provider = user.provider;
    }

    if (user.isVerified !== undefined) {
      values.isVerified = user.isVerified;
      updateSet.isVerified = user.isVerified;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Messenger Pages
export async function getMessengerPagesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(messengerPages).where(eq(messengerPages.userId, userId));
}

export async function getMessengerPageByPageId(pageId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(messengerPages).where(eq(messengerPages.pageId, pageId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMessengerPage(data: { userId: number; pageId: string; pageName?: string; pageAccessToken: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(messengerPages).values(data);
}

// Agent Configs
export async function getAgentConfigByPageId(pageId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(agentConfigs).where(eq(agentConfigs.pageId, pageId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrUpdateAgentConfig(data: Partial<AgentConfig> & { userId: number; pageId: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getAgentConfigByPageId(data.pageId);
  if (existing) {
    await db.update(agentConfigs).set(data).where(eq(agentConfigs.pageId, data.pageId));
  } else {
    await db.insert(agentConfigs).values(data as any);
  }
}

// Conversations
export async function getOrCreateConversation(userId: number, pageId: string, psid: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(conversations)
    .where(and(eq(conversations.userId, userId), eq(conversations.pageId, pageId), eq(conversations.psid, psid)))
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  await db.insert(conversations).values({ userId, pageId, psid });
  const result = await db.select().from(conversations)
    .where(and(eq(conversations.userId, userId), eq(conversations.pageId, pageId), eq(conversations.psid, psid)))
    .limit(1);
  return result[0];
}

export async function getConversationsByUserId(userId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(conversations)
    .where(eq(conversations.userId, userId))
    .limit(limit)
    .offset(offset);
}

// Messages
export async function createMessage(data: { conversationId: number; userId: number; pageId: string; psid: string; messageId: string; senderType: 'user' | 'agent'; content: string; contentType?: string; mediaUrl?: string; language?: string; responseTime?: number; errorMessage?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(messages).values(data);
}

export async function getMessagesByConversationId(conversationId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(messages)
    .where(eq(messages.conversationId, conversationId))
    .limit(limit);
}

// Subscriptions
export async function getSubscriptionByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSubscriptionByStripeCustomerId(stripeCustomerId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.stripeCustomerId, stripeCustomerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrUpdateSubscription(data: Partial<Subscription> & { userId: number; stripeCustomerId: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getSubscriptionByUserId(data.userId);
  if (existing) {
    await db.update(subscriptions).set(data).where(eq(subscriptions.userId, data.userId));
  } else {
    await db.insert(subscriptions).values(data as any);
  }
}

// User Preferences
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrUpdateUserPreferences(data: Partial<UserPreferences> & { userId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getUserPreferences(data.userId);
  if (existing) {
    await db.update(userPreferences).set(data).where(eq(userPreferences.userId, data.userId));
  } else {
    await db.insert(userPreferences).values(data as any);
  }
}

// Check if user has active subscription
export async function isUserSubscriptionActive(userId: number): Promise<boolean> {
  const sub = await getSubscriptionByUserId(userId);
  if (!sub) return false;
  return sub.status === 'active' || sub.status === 'trialing';
}

// Check if user has exceeded message limit
export async function hasExceededMessageLimit(userId: number): Promise<boolean> {
  const sub = await getSubscriptionByUserId(userId);
  if (!sub) return true;
  return sub.messagesUsed >= sub.messagesLimit;
}

// Increment message count
export async function incrementMessageCount(userId: number) {
  const db = await getDb();
  if (!db) return;
  const sub = await getSubscriptionByUserId(userId);
  if (sub) {
    await db.update(subscriptions).set({ messagesUsed: sub.messagesUsed + 1 }).where(eq(subscriptions.userId, userId));
  }
}
