"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import authService from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, Key } from "lucide-react";

// Password change form schema
const passwordChangeSchema = z.object({
  oldPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }),
  confirmPassword: z.string().min(1, { message: "Please confirm your new password." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangePasswordDialog({ isOpen, onOpenChange }: Props) {
  const { t } = useTranslation();
  const [changingPassword, setChangingPassword] = useState(false);

  // Initialize password change form
  const passwordForm = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onPasswordSubmit = async (values: z.infer<typeof passwordChangeSchema>) => {
    try {
      setChangingPassword(true);
      await authService.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      
      toast.success("Password changed successfully");
      onOpenChange(false);
      passwordForm.reset();
    } catch (error: unknown) {
      console.error("Failed to change password:", error);
      
      // Handle specific error messages
      const errorMessage = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Failed to change password");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    passwordForm.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            {t("dialogs.changePassword.title")}
          </DialogTitle>
          <DialogDescription>
            {t("dialogs.changePassword.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <FormField
              control={passwordForm.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dialogs.changePassword.currentPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("dialogs.changePassword.enterCurrentPassword")}
                      {...field}
                      disabled={changingPassword}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dialogs.changePassword.newPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("dialogs.changePassword.enterNewPassword")}
                      {...field}
                      disabled={changingPassword}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dialogs.changePassword.confirmNewPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("dialogs.changePassword.confirmNewPasswordPlaceholder")}
                      {...field}
                      disabled={changingPassword}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={changingPassword}
              >
                {t("dialogs.changePassword.cancel")}
              </Button>
              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                    {t("dialogs.changePassword.changing")}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Key className="mr-2 h-4 w-4" />
                    {t("dialogs.changePassword.changePassword")}
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}