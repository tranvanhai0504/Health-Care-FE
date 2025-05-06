import { z } from "zod";

const signUpFormSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Phone number cannot be empty")
    .regex(/^(\+\d{1,3}[- ]?)?\d{10}$/, "Invalid phone number format"),
});

export type SignUpFormType = z.infer<typeof signUpFormSchema>;

export default signUpFormSchema;
