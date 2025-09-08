"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  Star,
  MapPin,
  Calendar,
  Clock,
  Phone,
  Mail,
  Medal,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookScheduleButton } from "@/components/doctors/book-schedule-button";

// Mock data for a doctor - in a real app this would come from an API
const mockDoctor = {
  id: "123",
  name: "Dr. Sarah Johnson",
  specialty: "Cardiologist",
  experience: "12 years",
  rating: 4.8,
  reviews: 120,
  image: "https://randomuser.me/api/portraits/women/44.jpg",
  hospital: "HeartCare Medical Center",
  location: "123 Health Street, Medical District",
  education: [
    {
      degree: "MD in Cardiology",
      institution: "Harvard Medical School",
      year: "2010",
    },
    { degree: "Residency", institution: "Mayo Clinic", year: "2012" },
  ],
  languages: ["English", "Spanish"],
  about:
    "Dr. Sarah Johnson is a board-certified cardiologist with 12 years of experience specializing in cardiovascular health, preventive cardiology, and heart disease management. She provides compassionate care tailored to each patient's unique needs.",
  availability: [
    { day: "Monday", hours: "9:00 AM - 5:00 PM" },
    { day: "Wednesday", hours: "9:00 AM - 5:00 PM" },
    { day: "Friday", hours: "9:00 AM - 1:00 PM" },
  ],
  contactInfo: {
    phone: "+1 (555) 123-4567",
    email: "sarah.johnson@heartcare.com",
  },
};

export default function DoctorDetailsPage() {
  const params = useParams();
  const { t } = useTranslation();
  const [doctor, setDoctor] = useState<null | typeof mockDoctor>(null);
  const [loading, setLoading] = useState(true);

  // Simulate fetching doctor data
  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      try {
        // In a real app, this would be a fetch call:
        // const data = await doctorService.getById(params.id);
        // setDoctor(data);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setDoctor(mockDoctor);
      } catch (error) {
        console.error("Error fetching doctor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container py-8">
        <DoctorDetailsSkeleton />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold">Doctor Not Found</h2>
            <p className="mt-2">
              We couldn&apos;t find the doctor you&apos;re looking for.
            </p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Doctor Profile */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative h-40 w-40 overflow-hidden rounded-full">
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h2 className="mt-4 text-2xl font-bold">{doctor.name}</h2>
                <p className="text-muted-foreground">{doctor.specialty}</p>

                <div className="mt-2 flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(doctor.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm">
                    {doctor.rating} ({doctor.reviews} reviews)
                  </span>
                </div>

                <div className="mt-4 flex w-full flex-col gap-2">
                  <BookScheduleButton
                    doctorId={doctor.id}
                    doctorName={doctor.name}
                    className="w-full"
                  />

                  <Button variant="outline" className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    Contact
                  </Button>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-start">
                  <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doctor.hospital}</p>
                    <p className="text-sm text-muted-foreground">
                      {doctor.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Medal className="mr-2 h-5 w-5 text-muted-foreground" />
                  <p>{doctor.experience} Experience</p>
                </div>

                <div className="flex items-center">
                  <Mail className="mr-2 h-5 w-5 text-muted-foreground" />
                  <p>{doctor.contactInfo.email}</p>
                </div>

                <div className="flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-muted-foreground" />
                  <p>{doctor.contactInfo.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Doctor Details */}
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>About Doctor</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{doctor.about}</p>

              <div className="mt-6">
                <h3 className="text-lg font-medium">Education</h3>
                <ul className="mt-2 space-y-2">
                  {doctor.education.map((edu, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary"></div>
                      <div>
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-sm text-muted-foreground">
                          {edu.institution}, {edu.year}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium">Languages</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {doctor.languages.map((lang) => (
                    <span
                      key={lang}
                      className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctor.availability.map((slot) => (
                  <div
                    key={slot.day}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center">
                      <Calendar className="mr-4 h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{slot.day}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{slot.hours}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <BookScheduleButton
                  doctorId={doctor.id}
                  doctorName={doctor.name}
                  size="lg"
                  className="px-8"
                >
                  {t("common.bookASchedule")}
                </BookScheduleButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DoctorDetailsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Skeleton className="h-40 w-40 rounded-full" />
              <Skeleton className="mt-4 h-8 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
              <Skeleton className="mt-4 h-4 w-1/3" />
              <div className="mt-4 flex w-full flex-col gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="mr-2 h-5 w-5" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <div className="mt-6">
              <Skeleton className="h-6 w-1/4" />
              <div className="mt-2 space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-start">
                    <Skeleton className="mr-2 mt-1 h-2 w-2" />
                    <div className="w-full">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="mt-1 h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Skeleton className="h-12 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
