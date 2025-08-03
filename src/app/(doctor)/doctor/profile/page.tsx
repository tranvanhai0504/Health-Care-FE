"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Edit } from "lucide-react";

export default function DoctorProfilePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Link href="/doctor/profile/edit">
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Doctor Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Profile information will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
