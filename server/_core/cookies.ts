import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const isSecure = isSecureRequest(req);
  
  // For development and dynamic domains (Manus preview, Cloudflare tunnel),
  // avoid setting domain to prevent cookie scope mismatches.
  // Let the browser handle host-only cookies.
  const domain = undefined;

  return {
    domain,
    httpOnly: true,
    path: "/",
    // Use 'lax' for first-party auth (same site). Only use 'none' if you need cross-site cookies.
    // SameSite=None requires Secure=true, which may not work in dev environments.
    sameSite: isSecure ? "none" : "lax",
    secure: isSecure,
  };
}
