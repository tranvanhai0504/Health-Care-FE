import { z } from "zod";

export const VerifyOTPSchema = z.object({
  phoneNumber: z.string().min(10, {
    message: "Phone number is required.",
  }),
  code: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

export type VerifyOTP = z.infer<typeof VerifyOTPSchema>;
