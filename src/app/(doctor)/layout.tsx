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
      <div className="min-h-screen pt-16">
        <DoctorSidebar />
        <main className="ml-64">{children}</main>
      </div>
    </ProtectedRoute>
  );
} 