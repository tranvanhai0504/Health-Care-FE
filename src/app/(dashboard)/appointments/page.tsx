"use client";
import React, { useEffect, useState, useTransition } from "react";
import { scheduleService, Schedule } from "@/services/schedule";
import { consultationPackageService } from "@/services/consultationPackage";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  FileText,
} from "lucide-react";
import { format, parseISO, isPast, isFuture, isToday } from "date-fns";

// Simplified interfaces for demo purposes
interface ScheduleWithDetails extends Schedule {
  serviceName?: string;
  packageName?: string;
}

// Simple Badge component
const Badge = ({ 
  children, 
  className, 
  variant = "default" 
}: { 
  children: React.ReactNode; 
  className?: string; 
  variant?: "default" | "outline" | "success" | "warning" | "error" | "secondary"; 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "secondary":
        return "bg-gray-100 text-gray-800";
      case "outline":
        return "border border-gray-200 text-gray-800";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm ${getVariantStyles()} ${className || ''}`}>
      {children}
    </div>
  );
};

// Simple Tabs components
interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

const Tabs = ({ defaultValue, className, children }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  // Clone children and pass the active tab
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      if (child.type === TabsList || child.type === TabsContent) {
        return React.cloneElement(child, {
          activeTab,
          setActiveTab
        } as React.ComponentProps<typeof child.type>);
      }
    }
    return child;
  });
  
  return <div className={className}>{childrenWithProps}</div>;
};

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: React.Dispatch<React.SetStateAction<string>>;
}

const TabsList = ({ className, children, activeTab, setActiveTab }: TabsListProps) => {
  // Clone children and pass the active tab
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child) && child.type === TabsTrigger) {
      return React.cloneElement(child, {
        activeTab,
        setActiveTab
      } as React.ComponentProps<typeof child.type>);
    }
    return child;
  });
  
  return <div className={className}>{childrenWithProps}</div>;
};

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: React.Dispatch<React.SetStateAction<string>>;
}

const TabsTrigger = ({ value, className, children, activeTab, setActiveTab }: TabsTriggerProps) => {
  const isActive = activeTab === value;
  
  return (
    <button 
      className={`px-4 py-2 text-center ${isActive ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'} ${className || ''}`}
      onClick={() => setActiveTab && setActiveTab(value)}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  activeTab?: string;
}

const TabsContent = ({ value, className, children, activeTab }: TabsContentProps) => {
  if (value !== activeTab) return null;
  return <div className={`mt-4 ${className || ''}`}>{children}</div>;
};

const AppointmentsPage = () => {
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        
        // Fetch all schedules (in a real app, this would be filtered to the current user)
        const allSchedules = await scheduleService.getAll();
        
        // Enhancement: Fetch service/package details for each schedule
        const schedulesWithDetails = await Promise.all(
          allSchedules.map(async (schedule) => {
            try {
              // In a real app, this would use the correct field from the API
              const packageDetails = await consultationPackageService.getById(schedule.package_id);
              
              return {
                ...schedule,
                packageName: packageDetails.title,
              };
            } catch (err) {
              console.error(`Error fetching details for schedule ${schedule._id}:`, err);
              return schedule;
            }
          })
        );
        
        setSchedules(schedulesWithDetails);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load your appointments. Please try again later.");
        setLoading(false);
      }
    };

    startTransition(() => {
      fetchAppointments();
    });
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'EEEE, MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return format(parseISO(`2000-01-01T${timeString}`), 'h:mm a');
    } catch {
      return timeString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const upcomingAppointments = schedules.filter(schedule => {
    // Check if the appointment is in the future or today
    try {
      const date = parseISO(schedule.date);
      return isFuture(date) || isToday(date);
    } catch {
      return false;
    }
  });

  const pastAppointments = schedules.filter(schedule => {
    // Check if the appointment is in the past and not today
    try {
      const date = parseISO(schedule.date);
      return isPast(date) && !isToday(date);
    } catch {
      return false;
    }
  });

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
        <Button onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-5xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <p className="text-gray-600 mt-1">Manage and view your scheduled appointments</p>
        </div>
        <Button 
          className="mt-4 md:mt-0"
          onClick={() => router.push('/consultations')}
        >
          Book New Appointment
        </Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Upcoming Appointments</h3>
                  <p className="text-gray-500 mt-2">
                    You don&apos;t have any upcoming appointments. Would you like to book one?
                  </p>
                  <Button 
                    className="mt-6"
                    onClick={() => router.push('/consultations')}
                  >
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 mt-4">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment._id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 md:w-4/5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {appointment.packageName || 'Medical Appointment'}
                            </h3>
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center text-gray-600">
                                <Calendar size={16} className="mr-2" />
                                <span>{formatDate(appointment.date)}</span>
                              </div>
                              
                              <div className="flex items-center text-gray-600">
                                <Clock size={16} className="mr-2" />
                                <span>
                                  {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              {getStatusBadge(appointment.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-6 md:w-1/5 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-gray-200">
                        <Button 
                          variant="outline" 
                          className="w-full mb-2"
                          onClick={() => router.push(`/appointments/details/${appointment._id}`)}
                        >
                          View Details
                        </Button>
                        
                        {appointment.status === 'pending' || appointment.status === 'confirmed' ? (
                          <Button 
                            variant="outline" 
                            className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            Cancel
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Past Appointments</h3>
                  <p className="text-gray-500 mt-2">
                    You don&apos;t have any past appointments in our records.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 mt-4">
              {pastAppointments.map((appointment) => (
                <Card key={appointment._id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 md:w-4/5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {appointment.packageName || 'Medical Appointment'}
                            </h3>
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center text-gray-600">
                                <Calendar size={16} className="mr-2" />
                                <span>{formatDate(appointment.date)}</span>
                              </div>
                              
                              <div className="flex items-center text-gray-600">
                                <Clock size={16} className="mr-2" />
                                <span>
                                  {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              {getStatusBadge(appointment.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-6 md:w-1/5 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-gray-200">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => router.push(`/appointments/details/${appointment._id}`)}
                        >
                          View Details
                        </Button>
                        
                        {appointment.status === 'completed' && (
                          <Button 
                            variant="outline" 
                            className="w-full mt-2"
                            onClick={() => router.push(`/appointments/${appointment._id}/feedback`)}
                          >
                            Leave Feedback
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentsPage; 