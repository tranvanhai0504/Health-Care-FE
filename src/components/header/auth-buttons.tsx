"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

const AuthButtons = () => {
  const { isLoading } = useAuth();
  const { t } = useTranslation();

  return (
    <>
      <Button variant="ghost" asChild disabled={isLoading || false}>
        <Link href="/login">{t("navigation.authButtons.signIn")}</Link>
      </Button>
      <Button asChild disabled={isLoading || false}>
        <Link href="/register">{t("navigation.authButtons.signUp")}</Link>
      </Button>
    </>
  );
};

export { AuthButtons }; 