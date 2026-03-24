/**
 * Simple in-memory session store
 * In production, this should be replaced with Redis or a database
 */

interface SessionData {
  userId: number;
  email: string;
  name: string;
  createdAt: number;
  expiresAt: number;
}

class SessionStore {
  private sessions: Map<string, SessionData> = new Map();

  /**
   * Create a new session
   */
  createSession(sessionId: string, userId: number, email: string, name: string, expiryMs: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    this.sessions.set(sessionId, {
      userId,
      email,
      name,
      createdAt: now,
      expiresAt: now + expiryMs,
    });
    console.log(`[SessionStore] ✅ Created session: ${sessionId}`);
    console.log(`[SessionStore]    User: ${userId} (${email})`);
    console.log(`[SessionStore]    Expires in: ${Math.floor(expiryMs / 1000)}s`);
    console.log(`[SessionStore]    Total sessions now: ${this.sessions.size}`);
  }

  /**
   * Get session data
   */
  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    const sessionCount = this.sessions.size;
    const allSessionIds = Array.from(this.sessions.keys()).slice(0, 3); // First 3 for debugging
    
    if (!session) {
      console.log(`[SessionStore] ❌ Session not found: ${sessionId}`);
      console.log(`[SessionStore] Total sessions in store: ${sessionCount}`);
      if (sessionCount > 0) {
        console.log(`[SessionStore] Sample session IDs: ${allSessionIds.join(', ')}`);
      }
      return null;
    }

    // Check if expired
    const now = Date.now();
    const expiresIn = session.expiresAt - now;
    if (session.expiresAt < now) {
      console.log(`[SessionStore] ❌ Session expired: ${sessionId} (expired ${Math.floor(expiresIn / 1000)}s ago)`);
      this.sessions.delete(sessionId);
      return null;
    }

    console.log(`[SessionStore] ✅ Session found and valid: ${sessionId} (expires in ${Math.floor(expiresIn / 1000)}s)`);
    return session;
  }

  /**
   * Delete session
   */
  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    console.log(`[SessionStore] Deleted session: ${sessionId}`);
  }

  /**
   * Clear all expired sessions
   */
  clearExpiredSessions(): void {
    const now = Date.now();
    let count = 0;
    const sessionsToDelete: string[] = [];
    
    this.sessions.forEach((session, sessionId) => {
      if (session.expiresAt < now) {
        sessionsToDelete.push(sessionId);
        count++;
      }
    });

    sessionsToDelete.forEach(sessionId => this.sessions.delete(sessionId));

    if (count > 0) {
      console.log(`[SessionStore] Cleared ${count} expired sessions`);
    }
  }

  /**
   * Get session count (for debugging)
   */
  getSessionCount(): number {
    return this.sessions.size;
  }
}

// Export singleton instance
export const sessionStore = new SessionStore();

// Clear expired sessions every 5 minutes
setInterval(() => {
  sessionStore.clearExpiredSessions();
}, 5 * 60 * 1000);
