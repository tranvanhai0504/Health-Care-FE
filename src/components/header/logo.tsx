import React from "react";
import Link from "next/link";
import Image from "next/image";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="bg-primary/10 p-1 rounded-full">
        <Image src="/logos/logo.svg" alt="HealthCare" width={28} height={28} className="h-7 w-7" />
      </div>
      <span className="text-lg font-bold text-primary">HealthCare</span>
    </Link>
  );
};

export { Logo }; 