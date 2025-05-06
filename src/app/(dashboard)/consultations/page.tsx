"use client";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState, useTransition } from "react";
import { ConsultationService, consultationServiceApi } from "@/services/consultationService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Stethoscope, Clock } from "lucide-react";

const ConsultationsPage = () => {
  const [consultationServices, setConsultationServices] = useState<ConsultationService[]>([]);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    startTransition(async () => {
      try {
        const services = await consultationServiceApi.getAll();
        setConsultationServices(services);
      } catch (error) {
        console.error("Failed to fetch consultation services:", error);
      }
    });
  }, []);

  const filteredServices = consultationServices.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="py-16 space-y-6">
      <h1 className="text-3xl font-bold">Medical Consultation Services</h1>
      <p className="text-gray-600">
        Browse our range of medical consultation services offered by our expert healthcare professionals.
      </p>
      
      <Input 
        placeholder="Search services..." 
        className="h-12" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {isPending && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {!isPending && filteredServices.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No services found matching your search.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <Card
            key={service._id}
            className="hover:shadow-md transition-shadow duration-300"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Stethoscope size={20} />
                </div>
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm">
                  {formatPrice(service.price)}
                </div>
              </div>
              <CardTitle className="mt-4">{service.name}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-gray-500 text-sm">
                <Clock size={16} className="mr-2" />
                <span>Approx. 30-60 minutes</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/consultations/${service._id}`)}
              >
                View Details
              </Button>
              <Button 
                onClick={() => router.push(`/consultations/${service._id}/schedule`)}
              >
                Book Appointment
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ConsultationsPage;
