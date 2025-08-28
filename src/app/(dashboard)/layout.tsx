import React from "react";
import { AutoBreadcrumb } from "@/components/layout/auto-breadcrumb";
import { ServicesList } from "@/components/services-list";
import { FloatingChatButton } from "@/components/chat/floating-chat-button";
import { ChatPopup } from "@/components/chat/chat-popup";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-4 lg:!py-8 px-4 lg:px-10 max-w-7xl mt-16 relative">
      <AutoBreadcrumb />
      <div className="flex-1 container lg:py-4">{children}</div>
      <ServicesList />

      {/* AI Chat Components */}
      <FloatingChatButton />
      <ChatPopup />
    </div>
  );
}
