import React from "react";
import { AutoBreadcrumb } from "@/components/layout/auto-breadcrumb";
import { ServicesList } from "@/components/services-list";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto mt-6 !py-8 px-10 max-w-7xl">
      <AutoBreadcrumb />
      <div className="flex-1 container py-4">{children}</div>
      <ServicesList />
    </div>
  );
}
