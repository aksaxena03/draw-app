import { z } from "zod";

export const CreateuserSchema = z.object({
  name: z.string(),
  password: z.string(),
  email: z.string().email()
});

export const SigninSchema = z.object({
  email: z.string(),
  password: z.string()
});

export const CreateRoomSchema = z.object({
  slag: z.string()
});