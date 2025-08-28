"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
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
import { z } from "zod";
import signUpFormSchema from "@/schemas/sign-up";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { SignUpVerifyModal } from "@/components/dialogs/sign-up-verify";
import { authService } from "@/services";
import { toast } from "sonner";
import { PhoneIcon } from "lucide-react";

const SignUpPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  async function onSubmit(data: z.infer<typeof signUpFormSchema>) {
    startTransition(async () => {
      try {
        const response = await authService.register(data);
        console.log(response);
        setIsOpen(true);
        toast.success("Registration initiated. Please verify your OTP.");
      } catch (error) {
        console.error(error);
        toast.error("Failed to register. Please try again.");
      }
    });
  }

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-5 h-full px-2 md:px-10 py-6">
      <div className="flex flex-col justify-center col-span-3 items-center p-6 lg:p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center justify-center lg:justify-start space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Image
                src="/logos/logo.svg"
                alt="logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
            </div>
            <p className="text-xl font-bold text-primary">HealthCare</p>
          </div>

          <div className="space-y-3 text-center lg:text-left">
            <h1 className="font-bold text-3xl tracking-tight">
              Create your account
            </h1>
            <p className="text-muted-foreground">
              Join thousands of patients managing their health with us
            </p>
          </div>

          <div className="bg-card">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input
                            placeholder="Enter your phone number"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full py-6 text-base font-medium"
                  disabled={isPending}
                >
                  {isPending ? "Processing..." : "Continue"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button variant="outline" className="py-5 mt-4 w-full">
                <Image
                  src="/logos/google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                Google
              </Button>
            </div>
          </div>

          <div className="flex justify-center text-sm space-x-1">
            <p className="text-muted-foreground">Already have an account?</p>
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative col-span-2 h-full">
        <Image
          src="/images/sign-in-background.png"
          alt="Healthcare professionals"
          fill
          className="rounded-3xl object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/25 rounded-3xl flex flex-col justify-end p-12">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <blockquote className="text-white font-medium text-lg mb-4">
              &ldquo;The HealthCare app has transformed how I manage my medical
              needs. Booking schedules is now effortless.&rdquo;
            </blockquote>
            <footer className="flex items-center space-x-4">
              <div className="rounded-full bg-primary/20 p-1">
                <Image
                  src="/images/avatar.png"
                  alt="User"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div>
                <p className="text-white font-semibold">Sarah Johnson</p>
                <p className="text-white/80 text-sm">Patient since 2022</p>
              </div>
            </footer>
          </div>
        </div>
      </div>

      <SignUpVerifyModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        phoneNumber={form.getValues("phoneNumber")}
      />
    </div>
  );
};

export default SignUpPage;
