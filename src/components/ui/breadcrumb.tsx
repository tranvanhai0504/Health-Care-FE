import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbProps {
  className?: string;
  homeHref?: string;
  separator?: React.ReactNode;
  hideOnHome?: boolean;
  excludePaths?: string[];
  pathTranslations?: Record<string, string>;
}

export function Breadcrumb({
  className,
  homeHref = "/",
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground" />,
  hideOnHome = true,
  excludePaths = [],
  pathTranslations = {},
}: BreadcrumbProps) {
  const pathname = usePathname();
  
  // Check if current path should be excluded
  if (hideOnHome && pathname === "/") {
    return null;
  }
  
  if (excludePaths.some(path => pathname.startsWith(path))) {
    return null;
  }
  
  // Generate breadcrumb segments
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter(segment => {
      // Skip IDs and hash routes, which typically start with [ or :
      return !segment.match(/^\[.*\]$/) && 
             !segment.startsWith(":") && 
             !segment.startsWith("_");
    });
  
  if (segments.length === 0 && hideOnHome) {
    return null;
  }
  
  // Format a segment for display
  const formatSegment = (segment: string): string => {
    // Use translation if available
    if (pathTranslations[segment]) {
      return pathTranslations[segment];
    }
    
    // Convert dash/underscore to space and capitalize
    return segment
      .replace(/[-_]/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  
  // Generate path for a segment based on its position
  const getSegmentPath = (index: number): string => {
    return "/" + segments.slice(0, index + 1).join("/");
  };
  
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        <li className="flex items-center">
          <Link 
            href={homeHref}
            className="flex items-center text-muted-foreground hover:text-foreground"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>
        
        {segments.map((segment, index) => (
          <React.Fragment key={segment + index}>
            <li className="flex items-center text-muted-foreground">{separator}</li>
            <li>
              {index === segments.length - 1 ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {formatSegment(segment)}
                </span>
              ) : (
                <Link
                  href={getSegmentPath(index)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {formatSegment(segment)}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
