import { z } from "zod";

export const informationFormSchema = z.object({
  name: z.string().min(1, "Name cannot be empty"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  gender: z.string().min(1, "Gender selection is required"),
  address: z.string().min(1, "Address cannot be empty"),
});

export type InformationFormValues = z.infer<typeof informationFormSchema>; 