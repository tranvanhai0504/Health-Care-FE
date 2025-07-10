"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import AdminSidebar from "@/components/admin/AdminSidebar";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex min-h-screen pt-10">
        <AdminSidebar />
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
} 