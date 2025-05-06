import React from "react";
import { AutoBreadcrumb } from "@/components/layout/auto-breadcrumb";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto mt-6 px-10 ">
      <AutoBreadcrumb />
      <div className="flex-1 container py-6">{children}</div>
    </div>
  );
}
