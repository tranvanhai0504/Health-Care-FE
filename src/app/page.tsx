import { Suspense } from "react";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import Script from "next/script";

// Static imports for critical above-the-fold content
import { HeroSection } from "@/components/landing";

// Custom loading component for a better user experience
const SectionLoader = () => (
  <div className="h-96 bg-gray-50 animate-pulse rounded-lg mx-auto max-w-7xl my-8 px-6 md:px-8" />
);

// Dynamic imports for below-the-fold content with loading fallbacks
const SpecialtiesSection = dynamic(
  () =>
    import("@/components/landing/SpecialtiesSection").then((mod) => ({
      default: mod.SpecialtiesSection,
    })),
  { loading: () => <SectionLoader /> }
);

const ServicesSection = dynamic(
  () =>
    import("@/components/landing/ServicesSection").then((mod) => ({
      default: mod.ServicesSection,
    })),
  { loading: () => <SectionLoader /> }
);

const HealthPackagesSection = dynamic(
  () =>
    import("@/components/landing/HealthPackagesSection").then((mod) => ({
      default: mod.HealthPackagesSection,
    })),
  { loading: () => <SectionLoader /> }
);

const FeaturesSection = dynamic(
  () =>
    import("@/components/landing/FeaturesSection").then((mod) => ({
      default: mod.FeaturesSection,
    })),
  { loading: () => <SectionLoader /> }
);

const BlogSection = dynamic(
  () =>
    import("@/components/landing/BlogSection").then((mod) => ({
      default: mod.BlogSection,
    })),
  { loading: () => <SectionLoader /> }
);

const CTASection = dynamic(
  () =>
    import("@/components/landing/CTASection").then((mod) => ({
      default: mod.CTASection,
    })),
  { loading: () => <SectionLoader /> }
);

export const metadata: Metadata = {
  title: "Health Care Solutions | Modern Healthcare Services",
  description:
    "Providing quality healthcare services to improve your wellbeing and quality of life. Book schedules, consult with specialists, and access personalized care.",
  keywords: [
    "healthcare",
    "medical care",
    "doctor schedules",
    "healthcare solutions",
    "wellness",
    "health packages",
  ],
  openGraph: {
    title: "Health Care Solutions | Modern Healthcare Services",
    description:
      "Providing quality healthcare services to improve your wellbeing and quality of life.",
    url: "https://healthcaresolutions.com",
    siteName: "Health Care Solutions",
    locale: "en_US",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <div className="min-h-screen">
        {/* Critical above-the-fold content - loaded immediately */}
        <HeroSection />

        <Suspense fallback={<SectionLoader />}>
          <HealthPackagesSection />
        </Suspense>

        {/* Specialties section */}
        <Suspense fallback={<SectionLoader />}>
          <SpecialtiesSection />
        </Suspense>

        {/* Below-the-fold content with Suspense for better loading performance */}
        <Suspense fallback={<SectionLoader />}>
          <ServicesSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <FeaturesSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <BlogSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <CTASection />
        </Suspense>
      </div>

      {/* Structured data for SEO */}
      <Script
        id="structured-data"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {`
          {
            "@context": "https://schema.org",
            "@type": "MedicalOrganization",
            "name": "Health Care Solutions",
            "url": "https://healthcaresolutions.com",
            "logo": "https://healthcaresolutions.com/logo.png",
            "description": "Providing quality healthcare services to improve your wellbeing and quality of life.",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "123 Health Street",
              "addressLocality": "Medical City",
              "addressRegion": "HC",
              "postalCode": "12345",
              "addressCountry": "US"
            }
          }
        `}
      </Script>
    </>
  );
}
