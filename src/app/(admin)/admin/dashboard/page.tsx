"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  FileText, 
  Package, 
  Activity,
  TrendingUp
} from "lucide-react";
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      setCurrentDate(format(new Date(), 'MMMM dd, yyyy'));
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const statsCards = [
    {
      title: "Total Users",
      value: "3,427",
      description: "+12% from last month",
      icon: <Users className="h-6 w-6 text-blue-600" />,
      color: "bg-blue-50",
      trend: <TrendingUp className="h-4 w-4 text-green-600" />
    },
    {
      title: "Active Doctors",
      value: "64",
      description: "+4 new this month",
      icon: <UserCheck className="h-6 w-6 text-green-600" />,
      color: "bg-green-50",
      trend: <TrendingUp className="h-4 w-4 text-green-600" />
    },
    {
      title: "Appointments",
      value: "1,324",
      description: "+18% from last month",
      icon: <Calendar className="h-6 w-6 text-purple-600" />,
      color: "bg-purple-50",
      trend: <TrendingUp className="h-4 w-4 text-green-600" />
    },
    {
      title: "Blog Posts",
      value: "42",
      description: "+8 new this month",
      icon: <FileText className="h-6 w-6 text-yellow-600" />,
      color: "bg-yellow-50",
      trend: <TrendingUp className="h-4 w-4 text-green-600" />
    },
    {
      title: "Health Packages",
      value: "18",
      description: "3 promotions active",
      icon: <Package className="h-6 w-6 text-pink-600" />,
      color: "bg-pink-50",
      trend: <TrendingUp className="h-4 w-4 text-green-600" />
    },
    {
      title: "Monthly Revenue",
      value: "$42,500",
      description: "+22% from last month",
      icon: <Activity className="h-6 w-6 text-indigo-600" />,
      color: "bg-indigo-50",
      trend: <TrendingUp className="h-4 w-4 text-green-600" />
    }
  ];

  const recentActivities = [
    { id: 1, action: "User Registration", name: "John Smith", time: "10 minutes ago" },
    { id: 2, action: "New Appointment", name: "Sarah Johnson", time: "25 minutes ago" },
    { id: 3, action: "Package Purchase", name: "Michael Brown", time: "1 hour ago" },
    { id: 4, action: "Blog Post Published", name: "Dr. Amanda Lee", time: "2 hours ago" },
    { id: 5, action: "New Doctor Added", name: "Dr. Robert Chen", time: "3 hours ago" }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-500">{currentDate}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((card, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
                  <div className="flex items-center mt-1">
                    {card.trend}
                    <p className="text-xs text-gray-500 ml-1">{card.description}</p>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${card.color}`}>
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.name}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Weekly Revenue</span>
                <span className="font-bold">$12,500</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm font-medium">Monthly Appointments</span>
                <span className="font-bold">324 / 500</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm font-medium">User Satisfaction</span>
                <span className="font-bold">92%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">New Users Today</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Appointments Today</p>
                  <p className="text-2xl font-bold">48</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 