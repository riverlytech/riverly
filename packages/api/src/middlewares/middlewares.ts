import { bearerAuth } from "hono/bearer-auth";
import { createMiddleware } from "hono/factory";
import { jwtVerify, createRemoteJWKSet } from "jose";

import { env } from "@riverly/config";
import { Organization } from "@riverly/riverly";
import type { ApiKey } from "@riverly/riverly/auth/org-api-key/ty";
import { MemberRole } from "@riverly/ty";

import { getApiLogger } from "../lib/logging";

import type { JWTVerifiedUser } from "../lib/auth-types";
import type { Context } from "hono";

// Hoist JWKS loader so remote keys are cached across requests.
const JWKS = createRemoteJWKSet(new URL(`${env.BASEURL}/api/auth/jwks`));
const logger = getApiLogger(["middleware", "auth"]);

export async function verifyBetterAuthToken(token: string, c: Context) {
  try {
    const { payload } = (await jwtVerify(token, JWKS, {
      issuer: env.BASEURL, // Should match your JWT issuer, which is the BASE_URL
      audience: env.API_BASEURL, // Should match your JWT audience, which is the BASE_URL by default
    })) as { payload: JWTVerifiedUser };
    //
    // extract user details from JWT payload
    const user = {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
      name: payload.name,
      emailVerified: payload.emailVerified,
      image: payload.image,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
      defaultOrgId: payload.defaultOrgId,
    };
    c.set("user", user);
    return true;
  } catch (error) {
    logger.error("Token validation failed", { error });
    return false;
  }
}

export const orgMembership = createMiddleware(async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // short circuit if membership already set
  // this could be from previous middleware.
  if (c.get("membership")) {
    return next();
  }

  const url = new URL(c.req.url);
  const orgId = url.searchParams.get("orgId") ?? user.defaultOrgId;
  if (!orgId) {
    return c.json({ error: "User not linked to any Organization" }, 403);
  }

  const membership = await Organization.orgMembershipFromID({
    organizationId: orgId,
    userId: user.userId,
  });
  if (!membership) {
    return c.json({ error: "User not linked to any Organization" }, 403);
  }

  const membershipCtx = {
    memberId: membership.id,
    role: membership.role as MemberRole,
    orgId: membership.org.id,
    orgSlug: membership.org.slug,
    orgName: membership.org.name,
    metadata: membership.org.metadata,
  };
  c.set("membership", membershipCtx);

  return next();
});

export type MembershipCtx = {
  memberId: string;
  role: MemberRole;
  orgId: string;
  orgSlug: string;
  orgName: string;
  metadata: string | null;
};

async function verifyAPIKey(key: string) {
  const url = new URL(`${env.BASEURL}/api/auth/org-api-key/verify`);
  try {
    const resp = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // for now we are not concerned with permissions
      body: JSON.stringify({
        key,
      }),
    });

    if (!resp.ok) {
      return {
        valid: false,
        error: "Invalid API Key",
        key: null,
      };
    }
    const data = (await resp.json()) as {
      valid: boolean;
      error: string | null;
      key: Omit<ApiKey, "key"> | null;
    };
    return data;
  } catch (err) {
    logger.error("API key verification failed", { error: err });
    return {
      valid: false,
      error: "Auth service unavailable",
      key: null,
    };
  }
}

// This middlware combines the Bearer <Token> and x-api-key <Key> auth headers
// and validates the tokens based on the auth methods
export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const apiKey = c.req.header("x-api-key");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const middleware = bearerAuth({ verifyToken: verifyBetterAuthToken });
    return middleware(c, next);
  }

  if (apiKey) {
    const apiKeyVerified = await verifyAPIKey(apiKey);
    if (!apiKeyVerified.valid || !apiKeyVerified.key) {
      const status = apiKeyVerified.error === "Auth service unavailable" ? 503 : 401;
      return c.json(
        {
          error: {
            code: "forbidden",
            message: apiKeyVerified.error ?? "Invalid or missing API Key",
          },
        },
        status,
      );
    }

    const membership = await Organization.orgMembershipFromID({
      organizationId: apiKeyVerified.key.organizationId,
      userId: apiKeyVerified.key.userId,
    });
    if (!membership) {
      return c.json(
        {
          error: {
            code: "forbidden",
            message: "Invalid or missing API Key",
          },
        },
        401,
      );
    }

    const userCtx = {
      userId: membership.user.id,
      username: membership.user.username,
      email: membership.user.email,
      name: membership.user.name,
      emailVerified: membership.user.emailVerified,
      image: membership.user.image,
      createdAt: membership.user.createdAt,
      updatedAt: membership.user.updatedAt,
      defaultOrgId: membership.org.id,
    };
    const membershipCtx = {
      memberId: membership.id,
      role: membership.role as MemberRole,
      orgId: membership.org.id,
      orgSlug: membership.org.slug,
      orgName: membership.org.name,
      metadata: membership.org.metadata,
    };
    c.set("user", userCtx);
    c.set("membership", membershipCtx);
    return next();
  }
  return c.json(
    {
      error: {
        code: "unauthorized",
        message: "Missing or invalid authentication",
      },
    },
    401,
  );
});
