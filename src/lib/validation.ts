import { z } from "zod";

export const itemSchema = z.object({
  birthdate: z.coerce.date()
    .min(new Date('1900-01-01'), 'Date must be after 1900')
    .max(new Date(), 'Date cannot be in the future')
    .optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  t_number: z.string().optional(),
  gender: z.string().optional(),
  o_r_status: z.string().optional(),
  house_number: z.string().optional(),
  community: z.string().optional(),
  contact_number: z.string().optional(),
  option: z.string().optional(),
});

export const userSchema = z.object({
  f_name: z.string().optional(),
  l_name: z.string().optional(),
  email: z.string().email(),
  password: z.string(),
  role: z.string().default("admin")
});

