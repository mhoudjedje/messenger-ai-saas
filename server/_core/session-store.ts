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
    console.log(`[SessionStore] Created session ${sessionId} for user ${userId}`);
  }

  /**
   * Get session data
   */
  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      console.log(`[SessionStore] Session not found: ${sessionId}`);
      return null;
    }

    // Check if expired
    if (session.expiresAt < Date.now()) {
      console.log(`[SessionStore] Session expired: ${sessionId}`);
      this.sessions.delete(sessionId);
      return null;
    }

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
