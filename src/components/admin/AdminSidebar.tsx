"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Users,
  FileText,
  Calendar,
  Package,
  Stethoscope,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const AdminSidebar = () => {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { t } = useTranslation();

  const sidebarItems: SidebarItem[] = [
    {
      title: t("admin.sidebar.navigation.schedules"),
      href: "/admin/schedules",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      title: t("admin.sidebar.navigation.users"),
      href: "/admin/users",
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: t("admin.sidebar.navigation.healthServices"),
      href: "/admin/health-services",
      icon: <Stethoscope className="w-5 h-5" />,
    },
    {
      title: t("admin.sidebar.navigation.healthPackages"),
      href: "/admin/health-packages",
      icon: <Package className="w-5 h-5" />,
    },
    {
      title: t("admin.sidebar.navigation.blogs"),
      href: "/admin/blogs",
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="fixed left-0 top-20 w-64 h-[calc(100vh-80px)] bg-white border-r border-gray-200 flex flex-col z-30">
      <div className="px-6 py-5 border-b">
        <h1 className="text-xl font-bold text-primary">{t("admin.sidebar.title")}</h1>
      </div>

      <div className="px-6 py-5 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div>
            <p className="font-medium">{user?.name || t("admin.sidebar.user.admin")}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-6 py-4">
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-gray-100 transition-colors",
                  pathname === item.href &&
                    "bg-primary/10 text-primary font-medium"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-6 py-5 border-t mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-md hover:bg-red-50 text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>{t("admin.sidebar.user.logout")}</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
