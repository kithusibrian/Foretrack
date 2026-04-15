import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useChangePasswordMutation } from "@/features/user/userAPI";
import { toast } from "sonner";

const newPasswordPolicySchema = z
  .string()
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

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(4, "Current password is required"),
    newPassword: newPasswordPolicySchema,
    confirmPassword: z.string().min(1, "Confirm new password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export function PasswordForm() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = form.watch("newPassword");
  const confirmPassword = form.watch("confirmPassword");
  const shouldShowMatchStatus = confirmPassword.length > 0;
  const passwordsMatch = newPassword === confirmPassword;

  const onSubmit = (values: PasswordFormValues) => {
    if (isLoading) return;

    changePassword(values)
      .unwrap()
      .then((response) => {
        toast.success(response.message || "Password updated successfully");
        form.reset();
      })
      .catch((error) => {
        toast.error(error?.data?.message || "Failed to update password");
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  {...field}
                />
              </FormControl>
              {shouldShowMatchStatus && (
                <p
                  className={`text-sm ${passwordsMatch ? "text-green-600" : "text-red-500"}`}
                >
                  {passwordsMatch
                    ? "Passwords match"
                    : "Passwords do not match"}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={isLoading} type="submit">
          {isLoading && <Loader className="h-4 w-4 animate-spin" />}
          Update password
        </Button>
      </form>
    </Form>
  );
}
