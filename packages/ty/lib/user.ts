import z from "zod/v4";

export const sessionUserSchema = z.object({
  userId: z.string(),
  name: z.string(),
  username: z.string(),
  githubId: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  isStaff: z.boolean(),
  isBlocked: z.boolean(),
  image: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;


export const UserRoleEnum = {
  owner: "owner",
  admin: "admin",
  member: "member"
} as const;
export const UserRole = z.enum(Object.values(UserRoleEnum));


export type UserRole = z.infer<typeof UserRole>;

