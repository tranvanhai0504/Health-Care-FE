import React from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, UserIcon, Package, Settings, Clock } from "lucide-react";
import { ConsultationPackage, ConsultationService, UserProfile } from "@/types";
import { formatDuration } from "@/utils";

interface BookingConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingType: 'package' | 'service' | 'services';
  packageData?: ConsultationPackage;
  serviceData?: ConsultationService;
  servicesData?: ConsultationService[];
  selectedPriceOption?: string | null;
  selectedDate: Date | undefined;
  selectedTimeSlot: { 
    id: string; 
    label: string; 
    description: string; 
    start: string; 
    end: string; 
  } | null;
  totalPrice: number;
  formatCurrency: (amount: number) => string;
  onConfirm: () => void;
  onCancel: () => void;
  bookingInProgress: boolean;
  user: UserProfile | null;
}

export function BookingConfirmationDialog({
  open,
  onOpenChange,
  bookingType,
  packageData,
  serviceData,
  servicesData,
  selectedPriceOption,
  selectedDate,
  selectedTimeSlot,
  totalPrice,
  formatCurrency,
  onConfirm,
  onCancel,
  bookingInProgress,
  user,
}: BookingConfirmationDialogProps) {
  const getBookingTitle = () => {
    if (bookingType === 'package' && packageData) return packageData.title;
    if (bookingType === 'service' && serviceData) return serviceData.name;
    if (bookingType === 'services' && servicesData) return `${servicesData.length} Selected Services`;
    return 'Booking Confirmation';
  };

  const getBookingIcon = () => {
    if (bookingType === 'package') return <Package className="h-5 w-5 text-primary" />;
    if (bookingType === 'service') return <Settings className="h-5 w-5 text-primary" />;
    return <Settings className="h-5 w-5 text-primary" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Confirm Your Booking
          </DialogTitle>
          <DialogDescription>
            Please review your schedule details before confirming.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-muted/20 rounded-lg p-4 border border-border/60">
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-border/40">
              <span className="font-medium flex items-center gap-2">
                {getBookingIcon()}
                {bookingType === 'package' ? 'Package:' : bookingType === 'service' ? 'Service:' : 'Services:'}
              </span>
              <span className="font-semibold text-right">{getBookingTitle()}</span>
            </div>

            {/* Package specific details */}
            {bookingType === 'package' && packageData && (
              <>
                {packageData.priceOptions && packageData.priceOptions.length > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium">Plan:</span>
                    <span className="text-right">
                      {packageData.priceOptions.find(
                        (option) =>
                          option._id === selectedPriceOption ||
                          option.tier === selectedPriceOption
                      )?.tier}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Service specific details */}
            {bookingType === 'service' && serviceData && (
              <div className="flex justify-between items-center py-2">
                <span className="font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Duration:
                </span>
                <span className="text-right">{formatDuration(serviceData.duration)}</span>
              </div>
            )}

            {/* Multiple services details */}
            {bookingType === 'services' && servicesData && servicesData.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Total Services:</span>
                  <span className="text-right">{servicesData.length}</span>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {servicesData.map((service, index) => (
                    <div key={service._id} className="flex justify-between items-center text-sm py-1 border-b border-border/20 last:border-b-0">
                      <span className="text-muted-foreground truncate flex-1 mr-2">
                        {index + 1}. {service.name}
                      </span>
                      <span className="text-primary font-medium">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center py-2 border-t border-border/40 mt-3 pt-3">
              <span className="font-medium">Total Price:</span>
              <span className="text-primary font-bold text-right">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Date:</span>
              <span className="text-right">
                {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : ""}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Time Period:</span>
              <span className="text-right">
                {selectedTimeSlot
                  ? `${selectedTimeSlot.label} (${selectedTimeSlot.description})`
                  : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-muted/10 p-3 rounded-lg border border-border/60">
          <UserIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-sm">
            {user ? (
              <span className="text-green-600">
                Logged in as <span className="font-medium">{user.name || user.phoneNumber}</span>
              </span>
            ) : (
              <span className="text-amber-600">
                You&apos;ll need to login before booking
              </span>
            )}
          </span>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={bookingInProgress}
            className="border-border/60"
          >
            Go Back
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={bookingInProgress}
            className="bg-primary hover:bg-primary/90"
          >
            {bookingInProgress ? (
              <>
                <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 