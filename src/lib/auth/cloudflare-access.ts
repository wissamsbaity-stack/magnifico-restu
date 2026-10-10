import "server-only";

import { createRemoteJWKSet, jwtVerify } from "jose";
import { headers } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { ProfileRow } from "@/lib/supabase/types";

export class CloudflareAccessAuthError extends Error {}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for Cloudflare Access auth`);
  return value;
}

function normalizeTeamDomain(value: string): string {
  const withProtocol = /^https?:\/\//u.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/u, "");
}

function allowedEmails(): Set<string> {
  return new Set(
    requiredEnvironment("ADMIN_EMAILS")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function verifyCloudflareAdminHeaders(
  requestHeaders: Headers,
): Promise<ProfileRow> {
  const token = requestHeaders.get("cf-access-jwt-assertion");
  if (!token) throw new CloudflareAccessAuthError("Missing Cloudflare Access token");

  const teamDomain = normalizeTeamDomain(
    requiredEnvironment("CF_ACCESS_TEAM_DOMAIN"),
  );
  const audience = requiredEnvironment("CF_ACCESS_AUD");
  const jwks = createRemoteJWKSet(
    new URL(`${teamDomain}/cdn-cgi/access/certs`),
  );

  let payload;
  try {
    ({ payload } = await jwtVerify(token, jwks, {
      issuer: teamDomain,
      audience,
    }));
  } catch (error) {
    console.error("[requireCloudflareAdmin] JWT verification failed", error);
    throw new CloudflareAccessAuthError("Invalid Cloudflare Access token");
  }

  const email = typeof payload.email === "string" ? payload.email.toLowerCase() : "";
  if (!email || !allowedEmails().has(email)) {
    throw new CloudflareAccessAuthError("Cloudflare Access user is not allowed");
  }

  const now = new Date().toISOString();
  const profile: ProfileRow = {
    id: typeof payload.sub === "string" ? payload.sub : email,
    email,
    full_name: typeof payload.name === "string" ? payload.name : null,
    role: "admin",
    created_at: now,
    updated_at: now,
  };
  return profile;
}

export const requireCloudflareAdmin = cache(async () => {
  const requestHeaders = await headers();
  try {
    const profile = await verifyCloudflareAdminHeaders(requestHeaders);
    return { profile };
  } catch (error) {
    if (!(error instanceof CloudflareAccessAuthError)) throw error;
    redirect("/admin/login?error=unauthorized");
  }
});

export function cloudflareAccessLogoutUrl(): string {
  const teamDomain = normalizeTeamDomain(
    requiredEnvironment("CF_ACCESS_TEAM_DOMAIN"),
  );
  return `${teamDomain}/cdn-cgi/access/logout`;
}

