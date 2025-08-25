"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { 
  Home, 
  FileText, 
  Calendar, 
  User, 
  Users, 
  Settings, 
  Package, 
  Stethoscope, 
  Pill, 
  BookOpen, 
  HelpCircle,
  CircleUser,
  Clock,
  CreditCard
} from "lucide-react";

// Import services for entity resolution
import { specialtyService } from "@/services/specialties.service";
import { BlogService } from "@/services/blogs.service";
import { consultationServiceApi } from "@/services/consultationService.service";
import { doctorService } from "@/services/doctor.service";
import { consultationPackageService } from "@/services/consultationPackage.service";





// Interface for path configuration
interface PathConfig {
  icon?: React.ReactNode;
  label: string;
  hideFromBreadcrumb?: boolean;
}

/**
 * AutoBreadcrumb - Automatically generates breadcrumbs based on the current route
 * with configuration options for the healthcare application.
 */
export function AutoBreadcrumb() {
  const params = useParams();
  const pathname = usePathname();
  const [dynamicNames, setDynamicNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Create service instances
  const blogService = useMemo(() => new BlogService(), []);

  // Data fetchers for resolving dynamic paths to proper names
  const entityResolvers = useMemo(() => ({
    // Resolve specialty ID to specialty name
    "specialties": async (id: string) => {
      try {
        const specialty = await specialtyService.getSpecialtyOnly(id);
        return specialty.name;
      } catch (error) {
        console.error("Failed to resolve specialty:", error);
        return `Specialty ${id.slice(-4)}`;
      }
    },

      // Resolve blog ID to blog title
      "blogs": async (id: string) => {
        try {
          const response = await blogService.getBlogById(id);
          return response.data.title;
        } catch (error) {
          console.error("Failed to resolve blog:", error);
          return `Blog ${id.slice(-4)}`;
        }
      },

      // Resolve consultation service ID to service name
      "consultations": async (id: string) => {
        try {
          const service = await consultationServiceApi.getById(id);
          return service.name;
        } catch (error) {
          console.error("Failed to resolve consultation service:", error);
          return `Service ${id.slice(-4)}`;
        }
      },

      // Resolve doctor ID to doctor name
      "doctors": async (id: string) => {
        try {
          const doctor = await doctorService.getById(id);
          return `Dr. ${doctor.user}`;
        } catch (error) {
          console.error("Failed to resolve doctor:", error);
          return `Dr. ${id.slice(-4)}`;
        }
      },

      // Resolve health package ID to package name
      "health-packages": async (id: string) => {
        try {
          const packageData = await consultationPackageService.getById(id);
          return packageData.title;
        } catch (error) {
          console.error("Failed to resolve health package:", error);
          return `Package ${id.slice(-4)}`;
        }
      },
      
      // Resolve schedule ID to schedule reference
      "schedules": async (id: string) => {
        try {
          // This would be replaced with an actual API call when schedule service is available
          return `Schedule #${id.slice(-4)}`;
        } catch (error) {
          console.error("Failed to resolve schedule", error);
          return `Schedule #${id.slice(-4)}`;
        }
      },

    // Additional resolvers for nested routes
    "book-doctor": async (id: string) => {
      try {
        const doctor = await doctorService.getById(id);
        return `Book Dr. ${doctor.user}`;
      } catch (error) {
        console.error("Failed to resolve doctor for booking:", error);
        return `Book Dr. ${id.slice(-4)}`;
      }
    },
  }), [blogService]);

  // Memoize path configuration to prevent unnecessary re-renders
  const pathConfig = useMemo<Record<string, PathConfig>>(() => ({
    // Main sections
    "consultations": { icon: <Calendar className="h-3.5 w-3.5" />, label: "Consultations" },
    "specialties": { icon: <Stethoscope className="h-3.5 w-3.5" />, label: "Medical Specialties" },
    "blogs": { icon: <BookOpen className="h-3.5 w-3.5" />, label: "Health Blogs" },
    "set-up": { icon: <Settings className="h-3.5 w-3.5" />, label: "Setup" },
    "information": { icon: <FileText className="h-3.5 w-3.5" />, label: "Your Information" },
    "password": { icon: <Settings className="h-3.5 w-3.5" />, label: "Create Password" },
    "dashboard": { icon: <Home className="h-3.5 w-3.5" />, label: "Dashboard" },
    "schedules": { icon: <Calendar className="h-3.5 w-3.5" />, label: "My Schedules" },
    "prescriptions": { icon: <Pill className="h-3.5 w-3.5" />, label: "My Prescriptions" },
    "profiles": { icon: <Users className="h-3.5 w-3.5" />, label: "Profiles" },
    "doctors": { icon: <Stethoscope className="h-3.5 w-3.5" />, label: "Find Doctors" },
    "book-doctor": { icon: <Calendar className="h-3.5 w-3.5" />, label: "Book Doctor" },
    "tests": { icon: <FileText className="h-3.5 w-3.5" />, label: "Medical Services" },
    "pharmacy": { icon: <Pill className="h-3.5 w-3.5" />, label: "Pharmacy" },
    "health-packages": { icon: <Package className="h-3.5 w-3.5" />, label: "Health Packages" },
    "health-blog": { icon: <BookOpen className="h-3.5 w-3.5" />, label: "Health Blog" },
    "faqs": { icon: <HelpCircle className="h-3.5 w-3.5" />, label: "FAQs" },
    "settings": { icon: <Settings className="h-3.5 w-3.5" />, label: "Settings" },
    "sign-in": { icon: <User className="h-3.5 w-3.5" />, label: "Sign In", hideFromBreadcrumb: true },
    "sign-up": { icon: <User className="h-3.5 w-3.5" />, label: "Sign Up", hideFromBreadcrumb: true },
    "account": { icon: <CircleUser className="h-3.5 w-3.5" />, label: "My Account" },
    "booking": { icon: <Calendar className="h-3.5 w-3.5" />, label: "Booking" },
    
    // Sub-sections
    "profile": { icon: <User className="h-3.5 w-3.5" />, label: "Profile" },
    "details": { icon: <FileText className="h-3.5 w-3.5" />, label: "Details" },
    "history": { icon: <Clock className="h-3.5 w-3.5" />, label: "History" },
    "billing": { icon: <CreditCard className="h-3.5 w-3.5" />, label: "Billing" },
    "preferences": { icon: <Settings className="h-3.5 w-3.5" />, label: "Preferences" },
    "schedule": { icon: <Calendar className="h-3.5 w-3.5" />, label: "Schedule" },
    "edit": { icon: <FileText className="h-3.5 w-3.5" />, label: "Edit" },
    "create": { icon: <FileText className="h-3.5 w-3.5" />, label: "Create" },
    "view": { icon: <FileText className="h-3.5 w-3.5" />, label: "View" },
  }), []);

  // Memoize paths to exclude from breadcrumb navigation
  const excludePaths = useMemo(() => [
    // Auth related paths
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    
    // Error pages
    "/404",
    "/500",
    "/error",
    
    // Landing pages that don't need breadcrumbs
    "/landing",
    "/welcome",
    "/intro"
  ], []);

  // Memoize path translations generation
  const pathTranslations = useMemo(() => {
    const translations: Record<string, string> = {};
    
    // Add static translations from path config
    Object.entries(pathConfig).forEach(([path, config]) => {
      translations[path] = config.label;
    });
    
    // Add dynamic resolved entity names
    Object.entries(dynamicNames).forEach(([path, name]) => {
      translations[path] = name;
    });
    
    return translations;
  }, [pathConfig, dynamicNames]);

  // Memoize ObjectId checker function
  const isObjectId = useMemo(() => {
    return (str: string): boolean => {
      return /^[0-9a-fA-F]{24}$/.test(str);
    };
  }, []);

  // Resolve dynamic path segments
  useEffect(() => {
    const resolveDynamicPaths = async () => {
      if (!params || !pathname) return;
      
      const pathSegments = pathname.split('/').filter(Boolean);
      const newDynamicNames: Record<string, string> = {};
      const resolverPromises: Promise<void>[] = [];

      // Process each parameter
      Object.entries(params).forEach(([key, value]) => {
        if (typeof value === 'string' && value && isObjectId(value)) {
          // Find the parent segment (what type of entity this ID belongs to)
          const keyIndex = pathSegments.findIndex(seg => seg === value);
          const parentSegment = keyIndex > 0 ? pathSegments[keyIndex - 1] : null;
          
          if (parentSegment && parentSegment in entityResolvers) {
            const resolverPromise = (async () => {
              try {
                const resolver = entityResolvers[parentSegment as keyof typeof entityResolvers];
                const name = await resolver(value);
                if (name) {
                  newDynamicNames[value] = name;
                }
              } catch (error) {
                console.error(`Error resolving ${parentSegment} with ID ${value}:`, error);
              }
            })();
            resolverPromises.push(resolverPromise);
          }
          // Handle cases where the param key is 'id' and we need to determine type from URL
          else if (key === 'id') {
            for (const [segment, resolver] of Object.entries(entityResolvers)) {
              if (pathname.includes(`/${segment}/`)) {
                const resolverPromise = (async () => {
                  try {
                    const name = await resolver(value);
                    if (name) {
                      newDynamicNames[value] = name;
                    }
                  } catch (error) {
                    console.error(`Error resolving ${segment} with ID ${value}:`, error);
                  }
                })();
                resolverPromises.push(resolverPromise);
                break;
              }
            }
          }
        }
      });

      if (resolverPromises.length > 0) {
        setLoading(true);
        try {
          await Promise.all(resolverPromises);
          setDynamicNames(prev => ({ ...prev, ...newDynamicNames }));
        } catch (error) {
          console.error("Error resolving dynamic paths:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    resolveDynamicPaths();
  }, [params, pathname, entityResolvers, isObjectId]);

  // Render nothing while resolving dynamic paths for the first time
  if (loading && Object.keys(dynamicNames).length === 0) {
    return null;
  }

  return (
    <Breadcrumb
      pathTranslations={pathTranslations}
      excludePaths={excludePaths}
      homeHref="/"
      className="mb-4 py-2"
    />
  );
} 