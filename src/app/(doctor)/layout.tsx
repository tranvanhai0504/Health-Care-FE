"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import DoctorSidebar from "@/components/doctor/DoctorSidebar";
import React from "react";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="flex min-h-screen pt-10">
        <DoctorSidebar />
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
} 