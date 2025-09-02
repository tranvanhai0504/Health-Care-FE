"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAuth } from "@/hooks/useAuth";
import { LoginCredentials } from "@/types";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();
  const form = useForm<LoginCredentials>({
    defaultValues: {
      phoneNumber: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginCredentials) => {
    const result = await login(data);

    if (result.success) {
      // If there's a specific redirect URL (not just "/"), use it
      if (redirectUrl && redirectUrl !== "/") {
        router.push(redirectUrl);
      } else {
        // Auto-redirect based on user role from login response
        const userRole = result.user?.role;

        switch (userRole) {
          case "doctor":
            router.push("/doctor/dashboard");
            break;
          case "receptionist":
            router.push("/receptionist/dashboard");
            break;
          case "admin":
            router.push("/admin/schedules");
            break;
          default:
            router.push("/"); // Default user dashboard
        }
      }
    } else {
      toast.error(t("auth.login.signInFailed"));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{t("auth.login.signIn")}</CardTitle>
        <CardDescription>
          {t("auth.login.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.login.phoneNumber")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("auth.login.phonePlaceholder")}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.login.password")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={t("auth.login.passwordPlaceholder")}
                        {...field}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />

                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t("auth.login.rememberMe")}</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth.login.signingIn")}
                </>
              ) : (
                t("auth.login.signIn")
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/register")}
        >
          {t("auth.login.createAccount")}
        </Button>
        <Button
          variant="link"
          className="w-full"
          onClick={() => router.push("/forgot-password")}
        >
          {t("auth.login.forgotPassword")}
        </Button>
      </CardFooter>
    </Card>
  );
}
