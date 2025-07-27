"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import ReceptionistSidebar from "@/components/receptionist/ReceptionistSidebar";
import React from "react";

export default function ReceptionistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["receptionist"]}>
      <div className="flex min-h-screen pt-10">
        <ReceptionistSidebar />
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
} 