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
import { CheckCircle, UserIcon } from "lucide-react";
import { ConsultationPackage } from "@/services/consultationPackage";
import { UserProfile } from "@/services/auth";

interface BookingConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageData: ConsultationPackage;
  selectedPriceOption: string | null;
  selectedDate: Date | undefined;
  selectedTimeSlot: { start: string; end: string } | null;
  selectedPrice: number;
  formatCurrency: (amount: number) => string;
  onConfirm: () => void;
  onCancel: () => void;
  bookingInProgress: boolean;
  user: UserProfile | null;
}

export function BookingConfirmationDialog({
  open,
  onOpenChange,
  packageData,
  selectedPriceOption,
  selectedDate,
  selectedTimeSlot,
  selectedPrice,
  formatCurrency,
  onConfirm,
  onCancel,
  bookingInProgress,
  user,
}: BookingConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Confirm Your Booking
          </DialogTitle>
          <DialogDescription>
            Please review your appointment details before confirming.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-muted/20 rounded-lg p-4 border border-border/60">
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-border/40">
              <span className="font-medium">Package:</span>
              <span className="font-semibold text-right">{packageData.title}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Plan:</span>
              <span className="text-right">
                {
                  packageData.priceOptions.find(
                    (option) =>
                      option._id === selectedPriceOption ||
                      option.tier === selectedPriceOption
                  )?.tier
                }
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Price:</span>
              <span className="text-primary font-bold text-right">
                {formatCurrency(selectedPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Date:</span>
              <span className="text-right">
                {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : ""}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Time:</span>
              <span className="text-right">
                {selectedTimeSlot
                  ? `${selectedTimeSlot.start} - ${selectedTimeSlot.end}`
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