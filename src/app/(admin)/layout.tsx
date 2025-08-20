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
      <div className="min-h-screen pt-16">
        <AdminSidebar />
        <main className="ml-64">{children}</main>
      </div>
    </ProtectedRoute>
  );
}