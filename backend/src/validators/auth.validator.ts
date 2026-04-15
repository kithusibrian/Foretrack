import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("Invalid email address")
  .min(1)
  .max(255);

export const passwordSchema = z.string().trim().min(4);

export const passwordPolicySchema = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters")
  .refine((val) => /[A-Z]/.test(val), {
    message: "Must include at least one uppercase letter",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Must include at least one lowercase letter",
  })
  .refine((val) => /\d/.test(val), {
    message: "Must include at least one number",
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: "Must include at least one special character",
  })
  .refine((val) => !/\s/.test(val), {
    message: "Must not contain spaces",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordPolicySchema,
    confirmPassword: z.string().trim().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export const deleteAccountSchema = z.object({
  currentPassword: passwordSchema,
  confirmationText: z
    .string()
    .trim()
    .refine((value) => value === "DELETE", {
      message: 'Please type "DELETE" to confirm',
    }),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: emailSchema,
  password: passwordPolicySchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
export type DeleteAccountSchemaType = z.infer<typeof deleteAccountSchema>;
