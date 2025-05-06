import React from "react";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  VideoIcon, 
  Pill, 
  FileText, 
  PackageCheck, 
  LifeBuoy,
  ArrowRight
} from "lucide-react";

export default function DashboardPage() {
  // Mock data for appointments and prescriptions
  const appointments = 2;
  const prescriptions = 3;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-bold">Appointments</CardTitle>
          <Calendar className="w-5 h-5 text-primary" />
        </CardHeader>
        <CardDescription className="px-6">View your upcoming appointments</CardDescription>
        <CardContent className="pt-4">
          <p>You have {appointments} upcoming appointments this week.</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/appointments">
              View Appointments <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-bold">Consultations</CardTitle>
          <VideoIcon className="w-5 h-5 text-primary" />
        </CardHeader>
        <CardDescription className="px-6">Online doctor consultations</CardDescription>
        <CardContent className="pt-4">
          <p>Book a virtual consultation with a healthcare professional.</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" variant="outline">
            <Link href="/consultations">
              Schedule Consultation <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-bold">Prescriptions</CardTitle>
          <Pill className="w-5 h-5 text-primary" />
        </CardHeader>
        <CardDescription className="px-6">Manage your prescriptions</CardDescription>
        <CardContent className="pt-4">
          <p>You have {prescriptions} active prescriptions.</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" variant="outline">
            <Link href="/prescriptions">
              View Prescriptions <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-bold">Medical Records</CardTitle>
          <FileText className="w-5 h-5 text-primary" />
        </CardHeader>
        <CardDescription className="px-6">Access your health records</CardDescription>
        <CardContent className="pt-4">
          <p>View and download your medical reports and test results.</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" variant="outline">
            <Link href="/records">
              View Records <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-bold">Health Packages</CardTitle>
          <PackageCheck className="w-5 h-5 text-primary" />
        </CardHeader>
        <CardDescription className="px-6">Preventive healthcare plans</CardDescription>
        <CardContent className="pt-4">
          <p>Explore health checkup packages for you and your family.</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/health-packages">
              Browse Packages <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-bold">Support</CardTitle>
          <LifeBuoy className="w-5 h-5 text-primary" />
        </CardHeader>
        <CardDescription className="px-6">Get help with your queries</CardDescription>
        <CardContent className="pt-4">
          <p>Contact our customer support team for assistance.</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" variant="outline">
            <Link href="/support">
              Contact Support <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}