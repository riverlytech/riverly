import { createMiddleware } from "hono/factory";
import { jwtVerify, createRemoteJWKSet } from "jose";

import { env } from "@riverly/config";
import { Organization } from "@riverly/riverly";
import { MemberRole } from "@riverly/ty";

import type { JWTVerifiedUser } from "../lib/auth-types";
import type { Context } from "hono";

export async function verifyBetterAuthToken(token: string, c: Context) {
  try {
    const JWKS = createRemoteJWKSet(new URL(`${env.BASEURL}/api/auth/jwks`));
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
    console.error(error, "token validation failed");
    return false;
  }
}

export const orgMembership = createMiddleware(async (c, next) => {
  const user = c.get("user");
  if (!user) {
    c.json({ error: "Unauthorized" }, 401);
    return;
  }

  const url = new URL(c.req.url);
  const orgId = url.searchParams.get("orgId") ?? user.defaultOrgId;
  if (!orgId) {
    c.json({ error: "User not linked to any Organization" }, 403);
    return;
  }

  const membership = await Organization.orgMembershipFromID({
    organizationId: orgId,
    userId: user.userId,
  });
  if (!membership) {
    c.json({ error: "User not linked to any Organization" }, 403);
    return;
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
  await next();
});

export type MembershipCtx = {
  memberId: string;
  role: MemberRole;
  orgId: string;
  orgSlug: string;
  orgName: string;
  metadata: string | null;
};
