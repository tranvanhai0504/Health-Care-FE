import Image from "next/image";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="flex h-screen justify-center items-center relative overflow-hidden bg-gradient-to-br from-primary/10 via-white to-white pt-16">
      {/* Background decorative elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 -right-24 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left lg:pr-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="animate-pulse mr-2">●</span> 
              Your Health, Our Priority
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              Modern Healthcare <span className="text-primary">Solutions</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Providing quality healthcare services to improve your wellbeing and quality of life with cutting-edge medical technology and expert care.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2 shadow-md">
                <Calendar className="h-5 w-5" />
                                  Book Schedule
              </Button>
              <Button size="lg" variant="outline" className="group">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden relative bg-primary/20">
                    <Image 
                      src={`https://randomuser.me/api/portraits/men/${i + 10}.jpg`} 
                      alt={`User ${i}`} 
                      width={40} 
                      height={40} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="font-semibold text-gray-900">500+ Patients</div>
                <div className="text-sm text-gray-500">Trust our services</div>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block relative h-[500px]">
            <div className="absolute inset-0 bg-primary/10 rounded-tl-[100px] rounded-br-[100px]"></div>
            <div className="absolute inset-2 overflow-hidden rounded-tl-[90px] rounded-br-[90px] shadow-xl">
              <Image 
                src="/images/sign-in-background.png" 
                alt="Doctor with patient" 
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 p-4 bg-white rounded-xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Next Available</div>
                  <div className="font-medium">Today, 3:00 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 