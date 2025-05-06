"use client";
import React, { useEffect, useState, useTransition } from "react";
import { ConsultationService, consultationServiceApi } from "@/services/consultationService";
import { doctorService, Doctor } from "@/services/doctor";
import { roomService, Room } from "@/services/room";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, 
  Clock, 
  MapPin, 
  User, 
  Star,
  ChevronLeft
} from "lucide-react";

// Simple Separator component
const Separator = ({ className }: { className?: string }) => (
  <div className={`h-px bg-gray-200 w-full ${className || ''}`} />
);

// Simple Badge component
const Badge = ({ 
  children, 
  className, 
  variant 
}: { 
  children: React.ReactNode; 
  className?: string; 
  variant?: string; 
}) => (
  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm ${variant === 'outline' ? 'border border-gray-200' : ''} ${className || ''}`}>
    {children}
  </div>
);

interface ServiceDetailPageProps {
  params: {
    id: string;
  };
}

const ServiceDetailPage = ({ params }: ServiceDetailPageProps) => {
  const { id } = params;
  const [service, setService] = useState<ConsultationService | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        const serviceData = await consultationServiceApi.getById(id);
        setService(serviceData);

        // If doctor ID is available, fetch doctor details
        if (serviceData.doctor) {
          const doctorData = await doctorService.getById(serviceData.doctor as string);
          setDoctor(doctorData);
        }

        // If room ID is available, fetch room details
        if (serviceData.room) {
          const roomData = await roomService.getById(serviceData.room as string);
          setRoom(roomData);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching service details:", err);
        setError("Failed to load service details. Please try again later.");
        setLoading(false);
      }
    };

    startTransition(() => {
      fetchServiceDetails();
    });
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading || isPending) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => router.push('/consultations')}>
          Back to Services
        </Button>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="text-gray-500 mb-4">Service not found.</div>
        <Button onClick={() => router.push('/consultations')}>
          Back to Services
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center gap-1"
        onClick={() => router.push('/consultations')}
      >
        <ChevronLeft size={16} />
        Back to Services
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Service Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-primary/10 text-primary font-medium">
                  {formatPrice(service.price)}
                </Badge>
              </div>
              <CardTitle className="text-2xl mt-4">{service.name}</CardTitle>
              <CardDescription className="text-base">{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Clock size={16} className="mr-2" />
                  <span>Appointment Duration: Approx. 30-60 minutes</span>
                </div>

                {room && (
                  <div className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-2" />
                    <span>Room: {room.name} (Floor {room.roomFloor}, Room {room.roomNumber})</span>
                  </div>
                )}

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-2">What to Expect</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Initial consultation with a healthcare professional</li>
                    <li>Discussion of medical history and current concerns</li>
                    <li>Physical examination if required</li>
                    <li>Treatment recommendations and follow-up plan</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-2">Preparation</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Bring a list of current medications and supplements</li>
                    <li>Arrive 15 minutes before your appointment time</li>
                    <li>Bring any relevant medical records or test results</li>
                    <li>Wear comfortable clothing that allows easy examination if necessary</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => router.push(`/consultations/${service._id}/schedule`)}
              >
                Book This Service
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Doctor Information */}
        <div className="space-y-6">
          {doctor ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Doctor Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <User size={40} />
                  </div>
                  <h3 className="font-medium text-lg">Dr. {doctor.user}</h3>
                  <p className="text-gray-500">{doctor.specialization}</p>
                  <div className="flex items-center mt-1">
                    <Star size={16} className="text-yellow-500" />
                    <span className="ml-1">{doctor.averageRating.toFixed(1)} Rating</span>
                  </div>
                  <p className="mt-2 text-gray-600">{doctor.experience} years experience</p>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h4 className="font-medium mb-2">Qualifications</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {doctor.qualifications.map((qualification, index) => (
                      <li key={index}>{qualification}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Consultation Fee</h4>
                  <p className="text-gray-600">{formatPrice(doctor.consultationFee)}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/book-doctor/${doctor._id}`)}
                >
                  View Full Profile
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Related Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  This consultation service is provided by our team of qualified healthcare professionals.
                </p>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Need help?</h4>
                  <p className="text-gray-600">
                    Contact our customer service team for assistance with booking or any questions you might have.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/contact')}
                >
                  Contact Us
                </Button>
              </CardFooter>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Additional Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                    <Stethoscope size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium">Health Check-up</h4>
                    <p className="text-sm text-gray-500">Comprehensive assessment</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                    <Stethoscope size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium">Lab Tests</h4>
                    <p className="text-sm text-gray-500">Modern diagnostic facilities</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                    <Stethoscope size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium">Specialized Consultations</h4>
                    <p className="text-sm text-gray-500">Expert specialists available</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/health-packages')}
              >
                View Health Packages
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage; 