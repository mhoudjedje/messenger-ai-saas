import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME } from "../../shared/const";
import { verifySessionToken } from "./aiteam-auth";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

/**
 * Authenticate AITeam users (Email OTP + Google OAuth)
 * Uses custom JWT tokens stored in cookies
 */
async function authenticateAiteamUser(req: CreateExpressContextOptions["req"]): Promise<User | null> {
  try {
    // Parse cookies
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      console.log('[Auth] No cookie header found');
      return null;
    }

    const cookies = parseCookieHeader(cookieHeader);
    const sessionToken = cookies[COOKIE_NAME];

    if (!sessionToken) {
      console.log('[Auth] No session token in cookies');
      return null;
    }

    console.log('[Auth] Found session token, verifying...');
    // Verify the JWT token
    const payload = await verifySessionToken(sessionToken);
    if (!payload || !payload.userId) {
      console.warn("[Auth] Failed to verify AITeam session token", { payload });
      return null;
    }

    console.log('[Auth] Session token verified, userId:', payload.userId);

    // Get user from database
    const user = await db.getUserById(payload.userId);
    if (!user) {
      console.warn(`[Auth] User not found for userId: ${payload.userId}`);
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

    console.log(`[Auth] AITeam user authenticated: ${user.id} (${user.email})`);
    return user;
  } catch (error) {
    console.warn("[Auth] AITeam authentication failed:", error);
    return null;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  console.log('[Context] createContext called');
  let user: User | null = null;

  // Try AITeam authentication first (Email OTP + Google OAuth)
  console.log('[Context] Attempting AITeam authentication');
  user = await authenticateAiteamUser(opts.req);

  // If AITeam auth failed, try Manus OAuth
  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
