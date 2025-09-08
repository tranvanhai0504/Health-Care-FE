import { z } from "zod";

export const passwordFormSchema = z.object({
  password: z
    .string()
    .min(8, "validation.passwordMinLength")
    .regex(/[A-Z]/, "validation.passwordUppercase")
    .regex(/[a-z]/, "validation.passwordLowercase")
    .regex(/[0-9]/, "validation.passwordNumber"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "validation.passwordsDoNotMatch",
  path: ["confirmPassword"],
});

export type PasswordFormValues = z.infer<typeof passwordFormSchema>; 