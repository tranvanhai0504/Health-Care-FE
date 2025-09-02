"use client";

import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/providers/auth-provider";
import { I18nProvider } from "@/providers/i18n-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider>
        <AuthProvider>
          <Toaster 
            position="top-right" 
            richColors 
            toastOptions={{
              duration: 5000,
            }}
          />
          {children}
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
} 