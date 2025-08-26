"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Home, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface IconProps {
  isSuccess: boolean;
}

const Icon = ({ isSuccess }: IconProps) => (
  <div className={`flex items-center justify-center p-5 size-fit rounded-full mx-auto mb-5 ${isSuccess ? "bg-primary/10" : "bg-red-50"}`}>
    <div className={`flex items-center justify-center rounded-full size-fit p-5 ${isSuccess ? "bg-primary/20" : "bg-red-100"}`}>
      <div className={`flex items-center justify-center rounded-full bg-primary w-16 h-16 ${isSuccess ? "bg-primary/20" : "bg-red-500"}`}>
        {isSuccess ? (
          <Check className="h-10 w-10 text-white mx-auto animate-pulse" />
        ) : (
          <X className="h-10 w-10 text-white mx-auto" />
        )}
      </div>
    </div>
  </div>
);

interface TitleProps {
  isSuccess: boolean;
}

const Title = ({ isSuccess }: TitleProps) => (
  <h1
    className={`text-2xl font-bold`}
  >
    {isSuccess ? "Payment Successful!" : "Payment Failed"}
  </h1>
);

interface MessageProps {
  isSuccess: boolean;
}

const Message = ({ isSuccess }: MessageProps) => (
  <p className="text-gray-500 mt-3 text-base">
    {isSuccess
      ? "Thank you! Your payment has been processed successfully."
      : "Unfortunately, we couldn't process your payment. Please try again."}
  </p>
);

interface DetailsProps {
  ref: string | null;
  valid: boolean;
  payments: string | null;
  isSuccess: boolean;
}

const Details = ({ ref, valid, payments, isSuccess }: DetailsProps) => (
  <div className={`mt-6 text-sm text-gray-500 p-4 rounded-lg space-y-2 ${isSuccess ? "bg-primary/10" : "bg-red-50"}`}>
    <p className="flex justify-between">
      <strong>Transaction Ref:</strong>{" "}
      <span className="font-mono">{ref || "N/A"}</span>
    </p>
    <p className="flex justify-between">
      <strong>Validation:</strong> <span>{valid ? "Valid" : "Invalid"}</span>
    </p>
    <p className="flex justify-between">
      <strong>Payment IDs:</strong>{" "}
      <span className="font-mono">{payments || "N/A"}</span>
    </p>
  </div>
);

const Actions = () => (
  <div className="mt-8 flex justify-center gap-4">
    <Link href="/">
      <Button variant="outline">
        <Home className="mr-2 h-4 w-4" /> Go to Home
      </Button>
    </Link>
  </div>
);

const PaymentResultContent = () => {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const ref = searchParams.get("ref");
  const valid = searchParams.get("valid") === "true";
  const payments = searchParams.get("payments");

  const isSuccess = code === "00";

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="max-w-lg w-full text-center">
        <Icon isSuccess={isSuccess} />
        <Title isSuccess={isSuccess} />
        <Message isSuccess={isSuccess} />
        <Details ref={ref} valid={valid} payments={payments} isSuccess={isSuccess} />
        <Actions />
      </div>
    </div>
  );
};

const PaymentResultPage = () => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    }
  >
    <PaymentResultContent />
  </Suspense>
);

export default PaymentResultPage;
