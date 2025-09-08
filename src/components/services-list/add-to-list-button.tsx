"use client";

import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useServiceListSafe } from '@/hooks/useServiceListSafe';
import { ConsultationService } from '@/types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface AddToListButtonProps {
  service: ConsultationService;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
  showIcon?: boolean;
}

export function AddToListButton({ 
  service, 
  variant = "outline", 
  size = "default",
  className = "",
  showIcon = true 
}: AddToListButtonProps) {
  const { t } = useTranslation("common");
  const [isAdded, setIsAdded] = useState(false);
  const { addService, items, isClient } = useServiceListSafe();

  const isInList = isClient && items.some(item => item.service._id === service._id);

  const handleAddToList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addService(service);
    setIsAdded(true);
    
    toast.success(t('common.servicesList.addToList.successMessage', { serviceName: service.name }), {
      description: t('common.servicesList.addToList.successDescription'),
      duration: 2000,
    });

    // Reset the visual feedback after 2 seconds
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  if (isInList && !isAdded) {
    return (
      <Button
        variant="secondary"
        size={size}
        className={className}
        disabled
      >
        {showIcon && <Check className="h-4 w-4" />}
        {t('common.servicesList.addToList.inList')}
      </Button>
    );
  }

  return (
    <Button
      variant={isAdded ? "secondary" : variant}
      size={size}
      className={className}
      onClick={handleAddToList}
      disabled={isAdded}
    >
      {isAdded ? (
        <>
          {showIcon && <Check className="h-4 w-4" />}
          {t('common.servicesList.addToList.added')}
        </>
      ) : (
        <>
          {showIcon && <Plus className="h-4 w-4" />}
          {t('common.servicesList.addToList.addToList')}
        </>
      )}
    </Button>
  );
} 