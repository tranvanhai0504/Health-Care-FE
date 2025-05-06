"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Sample data for marketing images using placeholder service
const marketingImages = [
  {
    id: 1,
    src: "/images/hero/7f94bf88-c3ad-403b-b959-9e46359c379f.jpg",
    alt: "Healthcare Service 1",
    description: "Advanced diagnostic services with state-of-the-art equipment",
  },
  {
    id: 2,
    src: "/images/hero/17badcdb-03e6-4e81-9dc7-a1b1899cd8d7.jpg",
    alt: "Healthcare Service 2",
    description: "Professional consultation with specialists in various fields",
  },
  {
    id: 3,
    src: "/images/hero/60cc6a24-91a2-4615-a225-b8d9271c04d6.jpg",
    alt: "Healthcare Service 3",
    description: "Personalized treatment plans tailored to your needs",
  },
  {
    id: 4,
    src: "/images/hero/3781e3b3-20f0-4ec0-a44b-235150d8085e.jpg",
    alt: "Healthcare Service 4",
    description: "24/7 support and care for all patients",
  },
  {
    id: 5,
    src: "/images/hero/bf1409bb-aa40-457b-be8a-e0f110652cc6.jpg",
    alt: "Healthcare Service 5",
    description: "Personalized treatment plans tailored to your needs",
  },
  {
    id: 6,
    src: "/images/hero/d1d48006-50d0-4ffb-9d22-da7081bed23a.jpg",
    alt: "Healthcare Service 5",
    description: "Personalized treatment plans tailored to your needs",
  },
  {
    id: 7,
    src: "/images/hero/debaff88-6cf7-4c2c-8803-f2c062c3e79c.jpg",
    alt: "Healthcare Service 5",
    description: "Personalized treatment plans tailored to your needs",
  },
];

export function Slider() {
  return (
    <div className="w-full mx-auto">
      <Carousel className="w-full" opts={{ loop: true }}>
        <CarouselContent>
          {marketingImages.map((image) => (
            <CarouselItem key={image.id} className="p-10">
              <div className="p-1 h-full">
                <div className="overflow-hidden rounded-xl shadow-md h-full flex flex-col">
                  <div className="relative h-[500px]">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      quality={100}
                      className="transition-transform hover:scale-105 duration-300 object-cover"
                    />
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className=" bg-white" />
        <CarouselNext className=" bg-white" />
      </Carousel>
    </div>
  );
}
