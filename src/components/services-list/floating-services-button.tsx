"use client";

import React from 'react';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useServiceListSafe } from '@/hooks/useServiceListSafe';
import { cn } from '@/lib/utils';

export function FloatingServicesButton() {
  const { getTotalServices, toggleList, isOpen, isClient } = useServiceListSafe();
  const totalServices = getTotalServices();

  // Don't render anything during SSR or if list is empty
  if (!isClient || totalServices === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={toggleList}
        size="lg"
        className={cn(
          "size-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "flex items-center justify-center relative",
          isOpen && "bg-primary/80"
        )}
      >
        <ClipboardList size={24} />
        {totalServices > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 size-5 rounded-full p-0 flex items-center justify-center text-xs font-bold border-2 border-background"
          >
            {totalServices > 99 ? '99+' : totalServices}
          </Badge>
        )}
      </Button>
    </div>
  );
} 