"use client";
import React, { useEffect, useState } from "react";
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

// Type definition for entity resolver functions
type EntityResolver = (id: string) => Promise<string | null>;

interface EntityResolvers {
  [key: string]: EntityResolver;
}

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

  // Data fetchers for resolving dynamic paths to proper names
  const entityResolvers: EntityResolvers = {
    // Resolve doctor ID to doctor name
    "doctors": async (id: string) => {
      try {
        // This would be replaced with an actual API call
        // const response = await doctorService.getById(id);
        // return response.name;
        return `Dr. ${id.slice(0, 4).toUpperCase()}`;
      } catch (error) {
        console.error("Failed to resolve doctor", error);
        return null;
      }
    },
    
    // Resolve appointment ID to appointment reference
    "appointments": async (id: string) => {
      try {
        // This would be replaced with an actual API call
        // const response = await appointmentService.getById(id);
        // return `Appointment on ${new Date(response.date).toLocaleDateString()}`;
        return `Appointment #${id.slice(-4)}`;
      } catch (error) {
        console.error("Failed to resolve appointment", error);
        return null;
      }
    },
    
    // Resolve health package ID to package name
    "health-packages": async (id: string) => {
      try {
        // This would be replaced with an actual API call
        // const response = await packageService.getById(id);
        // return response.title;
        return `Health Package #${id.slice(-4)}`;
      } catch (error) {
        console.error("Failed to resolve health package", error);
        return null;
      }
    },
  };

  // Path configuration with icons and labels
  const pathConfig: Record<string, PathConfig> = {
    // Main sections
    "consultations": { icon: <Calendar className="h-3.5 w-3.5" />, label: "Consultations" },
    "set-up": { icon: <Settings className="h-3.5 w-3.5" />, label: "Setup" },
    "information": { icon: <FileText className="h-3.5 w-3.5" />, label: "Your Information" },
    "password": { icon: <Settings className="h-3.5 w-3.5" />, label: "Create Password" },
    "dashboard": { icon: <Home className="h-3.5 w-3.5" />, label: "Dashboard" },
    "appointments": { icon: <Calendar className="h-3.5 w-3.5" />, label: "My Appointments" },
    "profiles": { icon: <Users className="h-3.5 w-3.5" />, label: "Profiles" },
    "doctors": { icon: <Stethoscope className="h-3.5 w-3.5" />, label: "Find Doctors" },
    "tests": { icon: <FileText className="h-3.5 w-3.5" />, label: "Medical Tests" },
    "pharmacy": { icon: <Pill className="h-3.5 w-3.5" />, label: "Pharmacy" },
    "health-packages": { icon: <Package className="h-3.5 w-3.5" />, label: "Health Packages" },
    "health-blog": { icon: <BookOpen className="h-3.5 w-3.5" />, label: "Health Blog" },
    "faqs": { icon: <HelpCircle className="h-3.5 w-3.5" />, label: "FAQs" },
    "settings": { icon: <Settings className="h-3.5 w-3.5" />, label: "Settings" },
    "sign-in": { icon: <User className="h-3.5 w-3.5" />, label: "Sign In", hideFromBreadcrumb: true },
    "sign-up": { icon: <User className="h-3.5 w-3.5" />, label: "Sign Up", hideFromBreadcrumb: true },
    "account": { icon: <CircleUser className="h-3.5 w-3.5" />, label: "My Account" },
    
    // Sub-sections
    "profile": { icon: <User className="h-3.5 w-3.5" />, label: "Profile" },
    "details": { icon: <FileText className="h-3.5 w-3.5" />, label: "Details" },
    "history": { icon: <Clock className="h-3.5 w-3.5" />, label: "History" },
    "billing": { icon: <CreditCard className="h-3.5 w-3.5" />, label: "Billing" },
    "preferences": { icon: <Settings className="h-3.5 w-3.5" />, label: "Preferences" },
  };

  // Paths to exclude from breadcrumb navigation
  const excludePaths = [
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
  ];

  // Generate path translations from config and resolved dynamic entities
  const getPathTranslations = () => {
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
  };

  // Resolve dynamic path segments
  useEffect(() => {
    const resolveDynamicPaths = async () => {
      if (!params) return;
      
      const pathSegments = pathname?.split('/').filter(Boolean) || [];
      const newDynamicNames: Record<string, string> = {};
      let needsResolving = false;

      // Check each parameter to see if we need to resolve it
      Object.entries(params).forEach(([key, value]) => {
        if (typeof value === 'string' && value && key !== 'slug') {
          // Find the parent segment (what type of entity this ID belongs to)
          const parentSegmentIndex = pathSegments.findIndex(seg => seg === key);
          const parentSegment = parentSegmentIndex > 0 ? pathSegments[parentSegmentIndex - 1] : null;
          
          if (parentSegment && entityResolvers[parentSegment]) {
            needsResolving = true;
          }
        }
      });

      if (needsResolving) {
        setLoading(true);
        
        try {
          // Run all resolvers in parallel
          const resolverPromises = Object.entries(params)
            .filter(([key, value]) => typeof value === 'string' && value && key !== 'slug')
            .map(async ([key, id]) => {
              // Find which entity type this ID belongs to
              const pathSegments = pathname?.split('/').filter(Boolean) || [];
              const keyIndex = pathSegments.findIndex(seg => seg === key);
              const parentSegment = keyIndex > 0 ? pathSegments[keyIndex - 1] : null;
              
              if (parentSegment && entityResolvers[parentSegment]) {
                const resolver = entityResolvers[parentSegment];
                const name = await resolver(id as string);
                if (name) {
                  newDynamicNames[id as string] = name;
                }
              } else if (key === 'id') {
                // If the param is just 'id', look at its parent segment
                for (const [segment, resolver] of Object.entries(entityResolvers)) {
                  if (pathname?.includes(`/${segment}/`)) {
                    const name = await resolver(id as string);
                    if (name) {
                      newDynamicNames[id as string] = name;
                      break;
                    }
                  }
                }
              }
            });
            
          await Promise.all(resolverPromises);
          setDynamicNames(newDynamicNames);
        } catch (error) {
          console.error("Error resolving dynamic paths:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    resolveDynamicPaths();
  }, [params, pathname]);

  // Render nothing while resolving dynamic paths
  if (loading) {
    return null;
  }

  return (
    <Breadcrumb
      pathTranslations={getPathTranslations()}
      excludePaths={excludePaths}
      homeHref="/dashboard"
      className="mb-4 py-2"
    />
  );
} 