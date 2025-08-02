import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCallback, useState, useTransition } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { authService } from "@/services";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useSetupStore } from "@/stores/setup";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
};

export function SignUpVerifyModal({
  isOpen,
  onOpenChange,
  phoneNumber,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const setUserInfo = useSetupStore((state) => state.setUserInfo);

  const handleVerify = useCallback(() => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    startTransition(async () => {
      try {
        const response = await authService.verifyOTP({
          code: otp,
          phoneNumber: phoneNumber,
        });
        toast.success("OTP verified successfully");

        // Store the phone number in Zustand setup store
        if (response.msg.toLowerCase() === "ok") {
          setUserInfo({ phoneNumber });
        }

        // Redirect to appropriate page after successful verification
        router.push("/set-up");
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message: string }>;
        toast.error(
          axiosError.response?.data?.message || "Failed to verify OTP"
        );
      } finally {
        onOpenChange(false);
      }
    });
  }, [otp, phoneNumber, setUserInfo, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Verify OTP</DialogTitle>
          <DialogDescription className="text-xs">
            Please enter the OTP sent to your registered mobile number.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} className="size-13" />
              <InputOTPSlot index={1} className="size-13" />
              <InputOTPSlot index={2} className="size-13" />
              <InputOTPSlot index={3} className="size-13" />
              <InputOTPSlot index={4} className="size-13" />
              <InputOTPSlot index={5} className="size-13" />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <div className="text-xs flex items-center gap-1">
          <p>Can&apos;t find the OTP?</p>
          <Button variant="link" className="p-0 text-xs">
            Resend OTP
          </Button>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isPending || otp.length !== 6}
            onClick={handleVerify}
          >
            Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
