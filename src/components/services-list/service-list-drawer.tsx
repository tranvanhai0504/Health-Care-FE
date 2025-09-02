"use client";

import React from 'react';
import { Trash2, ClipboardList, Clock, Calendar } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useServiceListSafe } from '@/hooks/useServiceListSafe';
import { ServiceListItem } from '@/stores/service-list';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDuration } from '@/utils';
import { useTranslation } from 'react-i18next';

export function ServiceListDrawer() {
  const { t } = useTranslation();
  const {
    items,
    isOpen,
    setListOpen,
    removeService,
    clearList,
    getTotalServices,
    getTotalPrice,
    isClient,
  } = useServiceListSafe();
  const router = useRouter();

  const handleBookNow = () => {
    // Close the list and navigate to booking with services
    setListOpen(false);
    router.push('/booking?type=services');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setListOpen}>
      <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {t('servicesList.drawer.title')}
            <Badge variant="secondary" className="ml-auto">
              {getTotalServices()} {getTotalServices() === 1 ? t('servicesList.drawer.service') : t('servicesList.drawer.services')}
            </Badge>
          </SheetTitle>
          <SheetDescription>
            {t('servicesList.drawer.description')}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {!isClient ? (
            // Show loading state during hydration
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                {t('servicesList.drawer.loadingServices')}
              </h3>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                {t('servicesList.drawer.emptyList')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('servicesList.drawer.emptyListDescription')}
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-6">
              {items.map((item: ServiceListItem) => (
                <div
                  key={item.service._id}
                  className="border rounded-lg p-4 space-y-3 bg-card"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <h4 className="font-medium leading-tight">
                        {item.service.name}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.service.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(item.service.duration)}
                        </div>
                        <div className="font-medium text-primary">
                          {formatCurrency(item.service.price)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeService(item.service._id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isClient && items.length > 0 && (
          <div className="border-t bg-background p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium">{t('servicesList.drawer.totalServices')}:</span>
                <span className="font-medium">{getTotalServices()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">{t('servicesList.drawer.totalPrice')}:</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(getTotalPrice())}
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={clearList}
                className="flex-1"
              >
                {t('servicesList.drawer.clearAll')}
              </Button>
              <Button
                onClick={handleBookNow}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {t('servicesList.drawer.bookNow')}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
} 