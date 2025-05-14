"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";

// Sample data for marketing images using placeholder service
const marketingImages = [
  {
    id: 1,
    src: "/images/hero/7f94bf88-c3ad-403b-b959-9e46359c379f.jpg",
    alt: "Healthcare Service 1",
    description: "Advanced diagnostic services with state-of-the-art equipment",
    tag: "Diagnostics",
  },
  {
    id: 2,
    src: "/images/hero/17badcdb-03e6-4e81-9dc7-a1b1899cd8d7.jpg",
    alt: "Healthcare Service 2",
    description: "Professional consultation with specialists in various fields",
    tag: "Consultation",
  },
  {
    id: 3,
    src: "/images/hero/60cc6a24-91a2-4615-a225-b8d9271c04d6.jpg",
    alt: "Healthcare Service 3",
    description: "Personalized treatment plans tailored to your needs",
    tag: "Treatment",
  },
  {
    id: 4,
    src: "/images/hero/3781e3b3-20f0-4ec0-a44b-235150d8085e.jpg",
    alt: "Healthcare Service 4",
    description: "24/7 support and care for all patients",
    tag: "Support",
  },
  {
    id: 5,
    src: "/images/hero/bf1409bb-aa40-457b-be8a-e0f110652cc6.jpg",
    alt: "Healthcare Service 5",
    description: "Modern facilities with comfortable recovery environments",
    tag: "Facilities",
  },
  {
    id: 6,
    src: "/images/hero/d1d48006-50d0-4ffb-9d22-da7081bed23a.jpg",
    alt: "Healthcare Service 6",
    description: "Preventative care programs for long-term health",
    tag: "Prevention",
  },
  {
    id: 7,
    src: "/images/hero/debaff88-6cf7-4c2c-8803-f2c062c3e79c.jpg",
    alt: "Healthcare Service 7",
    description: "Family-focused health services for all ages",
    tag: "Family Care",
  },
];

export function Slider() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Handle carousel API changes
  const onApiChange = (api: CarouselApi) => {
    if (!api) return;
    setApi(api);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  };

  return (
    <div className="w-full mx-auto relative">
      <Carousel 
        className="w-full" 
        opts={{ 
          loop: true,
          dragFree: true,
        }}
        setApi={onApiChange}
      >
        <CarouselContent>
          {marketingImages.map((image) => (
            <CarouselItem key={image.id} className="md:basis-4/5 lg:basis-2/3">
              <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-lg mx-1 md:mx-2 group">
                {/* Image */}
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={image.id === 1}
                  quality={90}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80"></div>
                
                {/* Tag badge */}
                <Badge className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm text-white border-none font-semibold px-3 py-1">
                  {image.tag}
                </Badge>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-all duration-300 group-hover:translate-y-[-8px]">
                  <h3 className="text-xl md:text-2xl font-semibold mb-2">
                    {image.alt}
                  </h3>
                  <p className="text-sm md:text-base opacity-90 max-w-md">
                    {image.description}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Custom navigation controls */}
        <div className="absolute z-10 inset-0 flex items-center justify-between pointer-events-none">
          <CarouselPrevious className="h-10 w-10 mx-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800 shadow-md pointer-events-auto border-none" />
          <CarouselNext className="h-10 w-10 mx-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800 shadow-md pointer-events-auto border-none" />
        </div>
      </Carousel>
      
      {/* Slide indicators */}
      <div className="flex justify-center gap-1 mt-4">
        {marketingImages.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              current === index 
                ? "bg-primary w-6" 
                : "bg-gray-300 hover:bg-gray-400"
            )}
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
