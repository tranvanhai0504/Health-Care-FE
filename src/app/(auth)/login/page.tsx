"use client";

import { Suspense } from "react";
import SignInForm from "@/components/auth/signin-form";
import { useTranslation } from "react-i18next";

function SignInFormWrapper() {
  return <SignInForm />;
}

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col items-center justify-center py-12">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] md:w-[450px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("auth.login.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("auth.login.subtitle")}
          </p>
        </div>

        <Suspense fallback={<div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
          <SignInFormWrapper />
        </Suspense>
      </div>
    </div>
  );
}
