import z from "zod/v4";

export const sessionUserSchema = z.object({
  userId: z.string(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  defaultOrgId: z.string().nullable(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export const MemberRoleEnum = {
  owner: "owner",
  admin: "admin",
  member: "member",
} as const;
export const MemberRole = z.enum(Object.values(MemberRoleEnum));

export type MemberRole = z.infer<typeof MemberRole>;
