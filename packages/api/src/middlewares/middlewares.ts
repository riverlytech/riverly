import type { Context } from "hono";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { env } from "@riverly/config";
import type { JWTVerifiedUser } from "../lib/auth-types";
import { defaultAvatarUrl } from "@riverly/riverly";

export async function verifyBetterAuthToken(token: string, c: Context) {
  try {
    const JWKS = createRemoteJWKSet(new URL(`${env.BASEURL}/api/auth/jwks`));
    const { payload } = (await jwtVerify(token, JWKS, {
      issuer: env.BASEURL, // Should match your JWT issuer, which is the BASE_URL
      audience: env.API_BASEURL, // Should match your JWT audience, which is the BASE_URL by default
    })) as { payload: JWTVerifiedUser };
    const user = {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
      name: payload.name,
      emailVerified: payload.emailVerified,
      image: payload.image || defaultAvatarUrl(payload.username),
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
      githubId: payload.githubId,
      isStaff: payload.isStaff,
      isBlocked: payload.isBlocked,
    };
    c.set("user", user);
    return true;
  } catch (error) {
    console.error(error, "token validation failed");
    return false;
  }
}
