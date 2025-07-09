"use client";
import React, { useEffect, useState, useTransition, use } from "react";
import { consultationServiceApi } from "@/services/consultationService.service";
import { doctorService } from "@/services/doctor.service";
import { roomService } from "@/services/room.service";
import { specialtyService } from "@/services/specialties.service";
import { ConsultationService, Doctor, Room, Specialty } from "@/types";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Stethoscope, 
  Clock, 
  MapPin, 
  User, 
  Star,

  Calendar,
  Shield,
  Heart,
  Activity,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Users,
  Award,
  Zap
} from "lucide-react";
import { AddToListButton } from "@/components/services-list";
import { formatPrice, formatDuration } from "@/utils";

// Static data constants
const INCLUDED_ITEMS = [
  "Comprehensive medical assessment",
  "Detailed discussion of symptoms and concerns", 
  "Professional medical examination",
  "Personalized treatment recommendations"
];

const PREPARATION_ITEMS = [
  "Bring your medical history and current medications",
                "Arrive 15 minutes before your schedule",
  "Bring any relevant test results or reports", 
  "Wear comfortable, easily removable clothing"
];

const CONSULTATION_STEPS = [
  {
    number: 1,
    title: "Check-in & Registration",
    description: "Complete your registration and provide necessary documents",
    color: "blue"
  },
  {
    number: 2, 
    title: "Initial Assessment",
    description: "Discussion of your symptoms, concerns, and medical history",
    color: "green"
  },
  {
    number: 3,
    title: "Medical Examination", 
    description: "Comprehensive physical examination as needed",
    color: "yellow"
  },
  {
    number: 4,
    title: "Treatment Plan",
    description: "Receive personalized recommendations and follow-up care",
    color: "purple"
  }
];

const PROFESSIONAL_CARE_FEATURES = [
  "Board-certified specialists",
  "Modern facilities & equipment", 
  "Personalized treatment approach"
];

const QUICK_ACTIONS = [
  {
    icon: Heart,
    text: "View Health Packages",
    path: "/health-packages",
    color: "text-red-500"
  },
  {
    icon: Calendar,
                text: "My Schedules",
            path: "/schedules",
    color: "text-blue-500"
  },
  {
    icon: Stethoscope,
    text: "Browse All Services",
    path: "/consultations", 
    color: "text-green-500"
  }
];

const SUPPORT_OPTIONS = [
  {
    icon: Phone,
    text: "Call Support",
    color: "text-green-600"
  },
  {
    icon: Mail,
    text: "Email Us",
    color: "text-blue-600"
  }
];

interface ServiceDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}



// Component for hero section
const HeroSection = ({ 
  service, 
  specialty, 
  room, 
  formatPrice, 
  formatDuration, 
  router 
}: {
  service: ConsultationService;
  specialty: Specialty | null;
  room: Room | null;
  formatPrice: (price: number) => string;
  formatDuration: (duration: number) => string;
  router: ReturnType<typeof useRouter>;
}) => (
  <div className="mb-8">
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
            <div className="flex flex-col gap-2">
              {specialty && (
                <Badge variant="secondary" className="w-fit text-sm">
                  {specialty.name}
                </Badge>
              )}
              <Badge variant="outline" className="bg-primary/10 text-primary font-semibold text-lg w-fit px-3 py-1">
                {formatPrice(service.price)}
              </Badge>
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-black dark:text-white">
            {service.name}
          </h1>
          
          <p className="text-base text-muted-foreground leading-relaxed mb-6">
            {service.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium">{formatDuration(service.duration)}</span>
            </div>
            {room && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium">{room.name} - Floor {room.roomFloor}, Room {room.roomNumber}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">Professional consultation</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 min-w-[200px]">
          <Button 
            size="lg" 
            className="shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => router.push(`/booking?type=service&serviceId=${service._id}`)}
          >
            <Calendar className="h-5 w-5 mr-2" />
                                  Book Schedule
          </Button>
          <AddToListButton
            service={service}
            size="lg"
            variant="outline"
            className="shadow-md hover:shadow-lg transition-all duration-300"
          />
        </div>
      </div>
    </div>
  </div>
);

// Component for doctor information
const DoctorInfo = ({ 
  doctor, 
  formatPrice, 
  router 
}: {
  doctor: Doctor;
  formatPrice: (price: number) => string;
  router: ReturnType<typeof useRouter>;
}) => (
  <div className="xl:w-80 p-6 border rounded-lg">
    <div className="text-center pb-4">
      <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-primary mx-auto mb-4">
        <User className="h-12 w-12" />
      </div>
      <h3 className="text-xl font-semibold">Dr. {doctor.user}</h3>
      <p className="text-muted-foreground font-medium">{doctor.specialization}</p>
      <div className="flex items-center justify-center gap-1 mt-2">
        <Star className="h-4 w-4 text-yellow-500 fill-current" />
        <span className="text-lg font-bold">{doctor.averageRating.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">rating</span>
      </div>
    </div>
    
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Experience</span>
          <span className="font-bold text-primary">{doctor.experience} years</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Consultation Fee</span>
          <span className="font-bold text-green-600">{formatPrice(doctor.consultationFee)}</span>
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          Qualifications
        </h4>
        <ul className="text-sm space-y-2">
          {doctor.qualifications.slice(0, 3).map((qualification, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
              <span className="text-muted-foreground">{qualification}</span>
            </li>
          ))}
          {doctor.qualifications.length > 3 && (
            <li className="text-muted-foreground text-xs pl-5">+ {doctor.qualifications.length - 3} more qualifications</li>
          )}
        </ul>
      </div>
    </div>
    
    <div className="mt-6">
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => router.push(`/doctors/${doctor._id}`)}
      >
        View Full Profile
      </Button>
    </div>
  </div>
);

// Component for professional care fallback
const ProfessionalCareInfo = () => (
  <div className="xl:w-80 p-6 border rounded-lg">
    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
      <Shield className="h-5 w-5 text-primary" />
      Professional Care
    </h3>
    <p className="text-muted-foreground mb-4">
      This consultation service is provided by our team of qualified healthcare professionals.
    </p>
    <div className="space-y-3">
      {PROFESSIONAL_CARE_FEATURES.map((feature, index) => (
        <div key={index} className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm">{feature}</span>
        </div>
      ))}
    </div>
  </div>
);

// Component for service details
const ServiceDetails = () => (
  <div className="flex-1 p-6 border rounded-lg">
    <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
      <Activity className="h-5 w-5 text-primary" />
      What&apos;s Included & How to Prepare
    </h2>
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          What&apos;s Included
        </h3>
        <ul className="space-y-3">
          {INCLUDED_ITEMS.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-600">
          <Shield className="h-5 w-5" />
          How to Prepare
        </h3>
        <ul className="space-y-3">
          {PREPARATION_ITEMS.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

// Component for consultation steps
const ConsultationSteps = ({ serviceName }: { serviceName: string }) => (
  <div className="p-6 border rounded-lg">
    <div className="mb-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary" />
        Your Consultation Journey
      </h2>
      <p className="text-muted-foreground mt-2">
        Here&apos;s what you can expect during your {serviceName.toLowerCase()} consultation
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {CONSULTATION_STEPS.map((step) => (
        <div key={step.number} className="text-center">
          <div className="mb-4">
            <div className={`h-16 w-16 rounded-full bg-${step.color}-100 dark:bg-${step.color}-900 flex items-center justify-center mx-auto`}>
              <span className={`text-2xl font-bold text-${step.color}-600 dark:text-${step.color}-300`}>{step.number}</span>
            </div>
          </div>
          <h4 className={`font-semibold mb-2 text-${step.color}-600 dark:text-${step.color}-300`}>{step.title}</h4>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </div>
      ))}
    </div>
  </div>
);

// Component for related services
const RelatedServices = ({ 
  relatedServices, 
  specialty, 
  formatPrice, 
  formatDuration, 
  router 
}: {
  relatedServices: ConsultationService[];
  specialty: Specialty | null;
  formatPrice: (price: number) => string;
  formatDuration: (duration: number) => string;
  router: ReturnType<typeof useRouter>;
}) => (
  <div className="p-6 border rounded-lg">
    <div className="mb-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Stethoscope className="h-5 w-5 text-primary" />
        Related Services
      </h2>
      <p className="text-muted-foreground mt-2">
        Other consultation services in {specialty?.name || 'this specialty'}
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {relatedServices.map((relatedService) => (
        <div 
          key={relatedService._id} 
          className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => router.push(`/consultations/${relatedService._id}`)}
        >
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mb-3">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold text-sm leading-tight mb-2">{relatedService.name}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{relatedService.description}</p>
            <div className="flex items-center justify-between w-full pt-3 border-t">
              <Badge variant="outline" className="text-xs">
                {formatPrice(relatedService.price)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDuration(relatedService.duration)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Component for quick actions
const QuickActions = ({ router }: { router: ReturnType<typeof useRouter> }) => (
  <div className="rounded-lg">
    <div className="mb-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        Quick Actions
      </h2>
      <p className="text-muted-foreground mt-2">
        Explore more health services and manage your care
      </p>
    </div>
    <div className="flex flex-col sm:flex-row gap-3">
      {QUICK_ACTIONS.map((action, index) => {
        const IconComponent = action.icon;
        return (
          <Button 
            key={index}
            variant="outline" 
            className="flex-1 justify-start"
            onClick={() => router.push(action.path)}
          >
            <IconComponent className={`h-4 w-4 mr-3 ${action.color}`} />
            <span>{action.text}</span>
          </Button>
        );
      })}
    </div>
  </div>
);

// Component for contact support
const ContactSupport = () => (
  <div className="rounded-lg">
    <div className="mb-6">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Phone className="h-5 w-5 text-green-600" />
        Need Help?
      </h2>
      <p className="text-muted-foreground mt-2">
        Get assistance with booking or service questions
      </p>
    </div>
    <div className="space-y-3 flex gap-3">
      {SUPPORT_OPTIONS.map((option, index) => {
        const IconComponent = option.icon;
        return (
          <Button 
            key={index}
            variant="outline" 
            size="sm" 
            className="w-fit justify-start"
          >
            <IconComponent className={`h-4 w-4 mr-3 ${option.color}`} />
            <span>{option.text}</span>
          </Button>
        );
      })}
    </div>
  </div>
);

const ServiceDetailPage = ({ params }: ServiceDetailPageProps) => {
  // Use React.use() to unwrap the params Promise
  const { id } = use(params);
  
  const [service, setService] = useState<ConsultationService | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [relatedServices, setRelatedServices] = useState<ConsultationService[]>([]);
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

        // Fetch related data in parallel
        const promises = [];
        
        // If doctor ID is available, fetch doctor details
        if (serviceData.doctor) {
          promises.push(
            doctorService.getById(serviceData.doctor as string)
              .then(data => setDoctor(data))
              .catch(err => {
                console.warn("Could not fetch doctor details:", err.message);
                setDoctor(null);
              })
          );
        }

        // If room ID is available, fetch room details
        if (serviceData.room) {
          promises.push(
            roomService.getById(serviceData.room as string)
              .then(data => setRoom(data))
              .catch(err => {
                console.warn("Could not fetch room details:", err.message);
                setRoom(null);
              })
          );
        }

        // Check if specialization is already populated in the response
        if (serviceData.specialization) {
          const specialization = serviceData.specialization;
          if (typeof specialization === 'object' && specialization !== null) {
            // Specialization is already populated, use it directly
            setSpecialty(specialization);
          } else if (typeof specialization === 'string') {
            // Specialization is just an ID, need to fetch it
            promises.push(
              specialtyService.getSpecialtyOnly(specialization)
                .then(data => setSpecialty(data))
                .catch(err => {
                  console.warn("Could not fetch specialty details:", err.message);
                  setSpecialty(null);
                })
            );
          }
        }

        // Fetch related services from the same specialization
        if (serviceData.specialization) {
          const specializationId = typeof serviceData.specialization === 'string' 
            ? serviceData.specialization 
            : serviceData.specialization._id;
          
          promises.push(
            consultationServiceApi.getBySpecialization(specializationId)
              .then(data => {
                // Filter out current service and limit to 3 related services
                const services = Array.isArray(data) ? data : data.data || [];
                const filtered = services.filter(s => s._id !== serviceData._id).slice(0, 3);
                setRelatedServices(filtered);
              })
              .catch(err => {
                console.warn("Could not fetch related services:", err.message);
                setRelatedServices([]);
              })
          );
        }

        await Promise.allSettled(promises);
        setLoading(false);
      } catch (err: unknown) {
        console.error("Error fetching service details:", err);
        
        // Handle different types of errors more gracefully
        const error = err as { code?: string; response?: { status?: number } };
        if (error.code === 'ECONNABORTED') {
          setError("Request timed out. Please check your connection and try again.");
        } else if (error.response?.status === 404) {
          setError("Service not found. It may have been removed or the link is incorrect.");
        } else if (error.response?.status && error.response.status >= 500) {
          setError("Server error. Please try again in a few moments.");
        } else {
          setError("Failed to load service details. Please try again later.");
        }
        setLoading(false);
      }
    };

    startTransition(() => {
      fetchServiceDetails();
    });
  }, [id]);



  if (loading || isPending) {
    return (
      <div className="py-8 max-w-6xl mx-auto px-4">
        <Skeleton className="h-10 w-40 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-20 mb-4" />
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
                <Skeleton className="h-4 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6 max-w-md">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button onClick={() => router.push('/consultations')}>
              Back to Services
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4">
        <div className="text-center">
          <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Service not found</h1>
          <p className="text-gray-600 mb-6 max-w-md">
            The consultation service you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => router.push('/consultations')}>
            Browse All Services
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        <HeroSection 
          service={service}
          specialty={specialty}
          room={room}
          formatPrice={formatPrice}
          formatDuration={formatDuration}
          router={router}
        />

        <div className="space-y-8">
          <div className="flex flex-col xl:flex-row gap-8">
            {doctor ? (
              <DoctorInfo 
                doctor={doctor}
                formatPrice={formatPrice}
                router={router}
              />
            ) : (
              <ProfessionalCareInfo />
            )}
            <ServiceDetails />
          </div>

          <ConsultationSteps serviceName={service.name} />

          {relatedServices.length > 0 && (
            <RelatedServices 
              relatedServices={relatedServices}
              specialty={specialty}
              formatPrice={formatPrice}
              formatDuration={formatDuration}
              router={router}
            />
          )}

          <QuickActions router={router} />

          <ContactSupport />
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage; 