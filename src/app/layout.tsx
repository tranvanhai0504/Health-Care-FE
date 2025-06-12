import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/providers";
import { LoginModal } from "@/components/auth/login-modal";
import Header from "@/components/layout/header";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://healthcaresolutions.com"),
  title: {
    template: "%s | Health Care Solutions",
    default: "Health Care Solutions"
  },
  description: "Providing quality healthcare services to improve your wellbeing and quality of life.",
  keywords: ["healthcare", "medical", "health", "wellness", "doctor"],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} font-plus-jakarta-sans antialiased bg-background`}
      >
        <Providers>
          <Header />
          <LoginModal />
          <main className="relative space-y-10 min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
