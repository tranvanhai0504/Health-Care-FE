import { z } from "zod";

export const informationFormSchema = z.object({
  name: z.string().min(1, "validation.nameCannotBeEmpty"),
  dateOfBirth: z.date({
    required_error: "validation.dateOfBirthRequired",
  }),
  gender: z.string().min(1, "validation.genderRequired"),
  address: z.string().min(1, "validation.addressCannotBeEmpty"),
});

export type InformationFormValues = z.infer<typeof informationFormSchema>; 