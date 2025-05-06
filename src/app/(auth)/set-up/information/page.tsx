"use client";

import React, { useTransition } from "react";
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
  CalendarIcon,
  UserIcon,
  MapPinIcon,
} from "lucide-react";
import { informationFormSchema, type InformationFormValues } from "@/schemas/information";

const InformationPage = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<InformationFormValues>({
    resolver: zodResolver(informationFormSchema),
    defaultValues: {
      name: "",
      address: "",
    },
  });

  function onSubmit(data: InformationFormValues) {
    startTransition(async () => {
      try {
        // Here you would normally call your API service to save the data
        console.log(data);
        toast.success("Information saved successfully!");
        // Redirect to dashboard or next step
        router.push("/dashboard");
      } catch (error) {
        console.error(error);
        toast.error("Failed to save information. Please try again.");
      }
    });
  }

  return (
    <>
      <div className="space-y-2 text-center">
        <h1 className="font-bold text-2xl md:text-3xl tracking-tight text-gray-800">
          Complete Your Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Please provide your personal information to help us personalize your
          healthcare experience
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      placeholder="Enter your full name"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        type="date"
                        className="pl-10"
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          field.onChange(date);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        onChange={(e) => field.onChange(e.target.value)}
                        value={field.value}
                      >
                        <option value="" disabled>
                          Select your gender
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">
                          Prefer not to say
                        </option>
                      </select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      placeholder="Enter your address"
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
            className="w-full py-5 mt-2 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Information"}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default InformationPage;
