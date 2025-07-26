"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Calendar, 
  User, 
  FileText, 
  Stethoscope,
  Clock,
  ArrowRight
} from "lucide-react";

export default function UserDashboard() {
  const quickActions = [
    {
      title: "Book Appointment",
      description: "Schedule a consultation with our doctors",
      href: "/booking",
      icon: <Calendar className="h-6 w-6" />,
      color: "bg-blue-500"
    },
    {
      title: "My Schedules",
      description: "View your upcoming appointments",
      href: "/schedules",
      icon: <Clock className="h-6 w-6" />,
      color: "bg-green-500"
    },
    {
      title: "Health Articles",
      description: "Read health tips and medical insights",
      href: "/blogs",
      icon: <FileText className="h-6 w-6" />,
      color: "bg-purple-500"
    },
    {
      title: "My Profile",
      description: "Update your personal information",
      href: "/profile",
      icon: <User className="h-6 w-6" />,
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Your Health Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your healthcare journey with ease</p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-md ${action.color} text-white`}>
                        {action.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm">{action.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Welcome Message */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Health, Our Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Welcome to our healthcare platform! Here you can book appointments, 
              view your medical schedules, read health articles, and manage your profile.
            </p>
            <Button asChild>
              <Link href="/booking">
                <Calendar className="h-4 w-4 mr-2" />
                Book Your First Appointment
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Stay informed about your health with our latest articles and medical insights 
              from healthcare professionals.
            </p>
            <Button variant="outline" asChild>
              <Link href="/blogs">
                <FileText className="h-4 w-4 mr-2" />
                Read Health Articles
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
