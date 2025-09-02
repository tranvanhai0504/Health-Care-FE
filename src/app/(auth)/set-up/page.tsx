"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MoveRight, Sparkles, Clock, LucideShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const WelcomePage = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const handleStart = () => {
    router.push("/set-up/password");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-bold text-2xl md:text-3xl tracking-tight text-gray-800">
          {t("auth.setup.welcome.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("auth.setup.welcome.subtitle")}
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">{t("auth.setup.welcome.personalizedCare.title")}</h3>
              <p className="text-xs text-muted-foreground">
                {t("auth.setup.welcome.personalizedCare.description")}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">{t("auth.setup.welcome.quickSetup.title")}</h3>
              <p className="text-xs text-muted-foreground">
                {t("auth.setup.welcome.quickSetup.description")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
          <LucideShieldCheck className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-medium text-sm">{t("auth.setup.welcome.securePrivate.title")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("auth.setup.welcome.securePrivate.description")}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Button
          onClick={handleStart}
          className="w-full py-5 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary group"
        >
          {t("auth.setup.welcome.getStarted")}
          <MoveRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          {t("auth.setup.welcome.termsAgreement")}{" "}
          <a href="#" className="underline text-primary">
            {t("auth.setup.welcome.termsOfService")}
          </a>{" "}
          {t("auth.setup.welcome.and")}{" "}
          <a href="#" className="underline text-primary">
            {t("auth.setup.welcome.privacyPolicy")}
          </a>
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;
