import { describe, it, expect } from "vitest";

describe("Meta OAuth Configuration", () => {
  it("should have META_APP_ID configured", () => {
    const appId = process.env.META_APP_ID;
    expect(appId).toBeDefined();
    expect(appId).toBe("1245131857121147");
    expect(appId?.length).toBeGreaterThan(0);
  });

  it("should have META_APP_SECRET configured", () => {
    const appSecret = process.env.META_APP_SECRET;
    expect(appSecret).toBeDefined();
    expect(appSecret).toBe("d448cff1bfd26251618e95519d06467b");
    expect(appSecret?.length).toBeGreaterThan(0);
  });

  it("should generate valid OAuth login URL", () => {
    const appId = process.env.META_APP_ID;
    const redirectUri = "https://messengerai-crj7dbqp.manus.space/api/oauth/facebook/callback";
    
    // Construct OAuth URL
    const oauthUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth");
    oauthUrl.searchParams.set("client_id", appId || "");
    oauthUrl.searchParams.set("redirect_uri", redirectUri);
    oauthUrl.searchParams.set("scope", "pages_manage_metadata,pages_read_user_content,pages_manage_messaging");
    
    const url = oauthUrl.toString();
    
    expect(url).toContain("client_id=1245131857121147");
    expect(url).toContain("redirect_uri=https%3A%2F%2Fmessengerai-crj7dbqp.manus.space%2Fapi%2Foauth%2Ffacebook%2Fcallback");
    expect(url).toContain("scope=pages_manage_metadata");
  });

  it("should have valid App ID format", () => {
    const appId = process.env.META_APP_ID;
    // Meta App IDs are typically numeric strings
    expect(appId).toMatch(/^\d+$/);
  });

  it("should have valid App Secret format", () => {
    const appSecret = process.env.META_APP_SECRET;
    // Meta App Secrets are typically hex strings
    expect(appSecret).toMatch(/^[a-f0-9]+$/);
  });
});
