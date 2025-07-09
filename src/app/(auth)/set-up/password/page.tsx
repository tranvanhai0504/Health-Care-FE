"use client";

import React, { useState, useTransition } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  CheckCircle2Icon,
  XCircleIcon,
} from "lucide-react";
import {
  passwordFormSchema,
  type PasswordFormValues,
} from "@/schemas/password";
import authService from "@/services/auth.service";

const PasswordPage = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const password = form.watch("password");

  const passwordStrength = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  function onSubmit(data: PasswordFormValues) {
    startTransition(async () => {
      try {
        // Here you would normally call your API service to save the password
        const phoneNumber = localStorage.getItem("phoneNumber");
        if (!phoneNumber) {
          toast.error("Phone number not found");
          return;
        }

        await authService.createUser({
          ...data,
          phoneNumber,
        });
        toast.success("Password set successfully!");
        // Redirect to the next step
        router.push("/set-up/information");
      } catch (error) {
        console.error(error);
        toast.error("Failed to set password. Please try again.");
      }
    });
  }

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-bold text-2xl md:text-3xl tracking-tight text-gray-800">
          Create a Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Set a secure password to protect your healthcare account
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <LockIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
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
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <LockIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={toggleShowConfirmPassword}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showConfirmPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2 rounded-lg bg-muted/50 p-4">
            <p className="text-xs font-medium">Password requirements:</p>
            <ul className="space-y-1 text-xs">
              <li className="flex items-center gap-1.5">
                {passwordStrength.length ? (
                  <CheckCircle2Icon className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <XCircleIcon className="h-3.5 w-3.5 text-destructive" />
                )}
                At least 8 characters
              </li>
              <li className="flex items-center gap-1.5">
                {passwordStrength.uppercase ? (
                  <CheckCircle2Icon className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <XCircleIcon className="h-3.5 w-3.5 text-destructive" />
                )}
                At least one uppercase letter
              </li>
              <li className="flex items-center gap-1.5">
                {passwordStrength.lowercase ? (
                  <CheckCircle2Icon className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <XCircleIcon className="h-3.5 w-3.5 text-destructive" />
                )}
                At least one lowercase letter
              </li>
              <li className="flex items-center gap-1.5">
                {passwordStrength.number ? (
                  <CheckCircle2Icon className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <XCircleIcon className="h-3.5 w-3.5 text-destructive" />
                )}
                At least one number
              </li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full py-5 mt-2 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
            disabled={isPending}
          >
            {isPending ? "Setting Password..." : "Continue"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default PasswordPage;
