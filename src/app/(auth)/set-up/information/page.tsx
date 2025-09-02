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
import { CalendarIcon, UserIcon, MapPinIcon } from "lucide-react";
import {
  informationFormSchema,
  type InformationFormValues,
} from "@/schemas/information";
import { useSetupStore } from "@/stores/setup";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/stores/auth";
import { useTranslation } from "react-i18next";

const InformationPage = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const setUserInfo = useSetupStore((state) => state.setUserInfo);
  const userInfo = useSetupStore((state) => state.userInfo);
  const resetSetup = useSetupStore((state) => state.reset);
  const { fetchProfile } = useAuthStore();
  const { t } = useTranslation();
  
  const form = useForm<InformationFormValues>({
    resolver: zodResolver(informationFormSchema),
    defaultValues: {
      name: userInfo.name || "",
      address: userInfo.address || "",
      dateOfBirth: userInfo.dateOfBirth
        ? typeof userInfo.dateOfBirth === "string"
          ? new Date(userInfo.dateOfBirth)
          : userInfo.dateOfBirth
        : new Date(),
      gender: userInfo.gender || "",
    },
  });

  function onSubmit(data: InformationFormValues) {
    startTransition(async () => {
      try {
        // Save info to Zustand store
        setUserInfo({
          ...data,
          dateOfBirth: data.dateOfBirth.toISOString(),
        });

        // Update user profile (except password)
        await userService.updateProfile({
          name: data.name,
          address: data.address,
          dateOfBirth: data.dateOfBirth.toISOString(),
          gender: data.gender,
        });

        await fetchProfile();

        toast.success(t("auth.setup.information.informationSaved"));
        // Clear the setup store
        resetSetup();
        // Redirect to login or dashboard
        router.push("/");
      } catch (error) {
        console.error(error);
        toast.error(t("auth.setup.information.informationSaveFailed"));
      }
    });
  }

  return (
    <>
      <div className="space-y-2 text-center">
        <h1 className="font-bold text-2xl md:text-3xl tracking-tight text-gray-800">
          {t("auth.setup.information.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("auth.setup.information.subtitle")}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
                          render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.setup.information.fullName")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        placeholder={t("auth.setup.information.fullNamePlaceholder")}
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
                  <FormLabel>{t("auth.setup.information.dateOfBirth")}</FormLabel>
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
                  <FormLabel>{t("auth.setup.information.gender")}</FormLabel>
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
                          {t("auth.setup.information.selectGender")}
                        </option>
                        <option value="male">{t("auth.setup.information.male")}</option>
                        <option value="female">{t("auth.setup.information.female")}</option>
                        <option value="other">{t("auth.setup.information.other")}</option>
                        <option value="prefer_not_to_say">
                          {t("auth.setup.information.preferNotToSay")}
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
                  <FormLabel>{t("auth.setup.information.address")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        placeholder={t("auth.setup.information.addressPlaceholder")}
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
            {isPending ? t("auth.setup.information.saving") : t("auth.setup.information.saveInformation")}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default InformationPage;
