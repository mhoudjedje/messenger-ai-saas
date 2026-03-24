import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME } from "../../shared/const";
import { dbSessionStore } from "./db-session-store";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

/**
 * Authenticate AITeam users (Email OTP + Google OAuth)
 * Uses database-backed session storage
 */
async function authenticateAiteamUser(req: CreateExpressContextOptions["req"]): Promise<User | null> {
  try {
    console.log('[Auth] 🔍 authenticateAiteamUser called');
    // Parse cookies
    const cookieHeader = req.headers.cookie;
    console.log('[Auth]    Cookie header:', cookieHeader ? 'present' : 'missing');
    if (!cookieHeader) {
      console.log('[Auth] ❌ No cookie header found');
      return null;
    }

    const cookies = parseCookieHeader(cookieHeader);
    console.log('[Auth]    Parsed cookies:', Object.keys(cookies));
    console.log('[Auth]    Looking for COOKIE_NAME:', COOKIE_NAME);
    const sessionId = cookies[COOKIE_NAME];
    console.log('[Auth]    Session ID found:', !!sessionId);

    if (!sessionId) {
      console.log('[Auth] ❌ No session ID in cookies');
      return null;
    }

    console.log('[Auth]    Session ID:', sessionId.substring(0, 20) + '...');
    console.log('[Auth] 🔍 Verifying session in database...');
    // Verify the server session
    const sessionData = await dbSessionStore.getSession(sessionId);
    if (!sessionData || !sessionData.userId) {
      console.warn("[Auth] ❌ Failed to verify AITeam session", { sessionData });
      return null;
    }

    console.log('[Auth] ✅ Session verified, userId:', sessionData.userId);

    // Get user from database
    const user = await db.getUserById(sessionData.userId);
    if (!user) {
      console.warn(`[Auth] ❌ User not found for userId: ${sessionData.userId}`);
      return null;
    }

    // Update lastSignedIn
    await db.upsertUser({
      openId: user.openId || `aiteam_${user.id}`,
      email: user.email || undefined,
      phone: user.phone || undefined,
      provider: user.provider || "email",
      lastSignedIn: new Date(),
    });

    console.log(`[Auth] ✅ AITeam user authenticated: ${user.id} (${user.email})`);
    return user;
  } catch (error) {
    console.warn("[Auth] ❌ AITeam authentication failed:", error);
    return null;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  console.log('[Context] 🔍 createContext called');
  let user: User | null = null;

  // Try AITeam authentication (Email OTP + Google OAuth)
  console.log('[Context] 🔍 Attempting AITeam authentication');
  user = await authenticateAiteamUser(opts.req);

  if (user) {
    console.log('[Context] ✅ User authenticated:', user.id);
  } else {
    console.log('[Context] ⚠️  No user authenticated - public access');
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
