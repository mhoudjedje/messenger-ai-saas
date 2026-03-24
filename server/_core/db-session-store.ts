import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { sessions } from "../../drizzle/schema";

export interface SessionData {
  userId: number;
  email: string;
  userName: string | null;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Database-backed session store
 * Replaces in-memory storage to ensure sessions persist across server restarts
 */
class DbSessionStore {
  /**
   * Create a new session in the database
   */
  async createSession(
    sessionId: string,
    userId: number,
    email: string,
    userName: string,
    expiryMs: number = 24 * 60 * 60 * 1000
  ): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.error("[DbSessionStore] ❌ Database not available");
        return;
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + expiryMs);

      await db.insert(sessions).values({
        id: sessionId,
        userId,
        email,
        userName,
        createdAt: now,
        expiresAt,
      });

      console.log(`[DbSessionStore] ✅ Created session: ${sessionId}`);
      console.log(`[DbSessionStore]    User: ${userId} (${email})`);
      console.log(`[DbSessionStore]    Expires in: ${Math.floor(expiryMs / 1000)}s`);
    } catch (error) {
      console.error("[DbSessionStore] ❌ Error creating session:", error);
    }
  }

  /**
   * Get session data from the database
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const db = await getDb();
      if (!db) {
        console.error("[DbSessionStore] ❌ Database not available");
        return null;
      }

      const result = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);

      if (result.length === 0) {
        console.log(`[DbSessionStore] ❌ Session not found: ${sessionId}`);
        return null;
      }

      const session = result[0]!;
      const now = new Date();

      // Check if expired
      if (session.expiresAt < now) {
        console.log(
          `[DbSessionStore] ❌ Session expired: ${sessionId} (expired ${Math.floor(
            (now.getTime() - session.expiresAt.getTime()) / 1000
          )}s ago)`
        );
        // Delete expired session
        await db.delete(sessions).where(eq(sessions.id, sessionId));
        return null;
      }

      const expiresIn = Math.floor((session.expiresAt.getTime() - now.getTime()) / 1000);
      console.log(`[DbSessionStore] ✅ Session found and valid: ${sessionId} (expires in ${expiresIn}s)`);

      return {
        userId: session.userId,
        email: session.email,
        userName: session.userName,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      };
    } catch (error) {
      console.error("[DbSessionStore] ❌ Error getting session:", error);
      return null;
    }
  }

  /**
   * Delete a session from the database
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.error("[DbSessionStore] ❌ Database not available");
        return;
      }

      await db.delete(sessions).where(eq(sessions.id, sessionId));
      console.log(`[DbSessionStore] ✅ Deleted session: ${sessionId}`);
    } catch (error) {
      console.error("[DbSessionStore] ❌ Error deleting session:", error);
    }
  }

  /**
   * Clean up expired sessions (should be called periodically)
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const db = await getDb();
      if (!db) {
        console.error("[DbSessionStore] ❌ Database not available");
        return 0;
      }

      const now = new Date();
      await db.delete(sessions).where(eq(sessions.expiresAt, now));

      console.log(`[DbSessionStore] ✅ Cleaned up expired sessions`);
      return 0; // Drizzle doesn't expose rowsAffected for delete operations
    } catch (error) {
      console.error("[DbSessionStore] ❌ Error cleaning up sessions:", error);
      return 0;
    }
  }
}

// Export singleton instance
export const dbSessionStore = new DbSessionStore();
