import { Heart, Award, Clock, CheckCircle, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function FeaturesSection() {
  return (
    <section className="py-10 md:py-10 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative">
        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="text-center mb-16 relative z-10">
          <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/20 bg-primary/5 text-primary">
            Why Choose Us
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Excellence in Healthcare
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We&apos;re committed to providing exceptional healthcare services with a focus on quality,
            compassion, and innovation.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 relative z-10">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 group">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 transform transition-transform group-hover:scale-110 group-hover:bg-primary/20 group-hover:rotate-3">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Patient-Centered Care</h3>
            <p className="text-gray-600 mb-6">We prioritize your needs and preferences to deliver personalized treatment plans that address your unique health concerns.</p>
            <ul className="space-y-2">
              {["Personalized treatment plans", "Compassionate care", "Patient education"].map((item, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mr-2 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 group md:transform md:translate-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 transform transition-transform group-hover:scale-110 group-hover:bg-primary/20 group-hover:rotate-3">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Expert Specialists</h3>
            <p className="text-gray-600 mb-6">Our team consists of highly trained medical professionals across various disciplines, ensuring you receive the best possible care.</p>
            <ul className="space-y-2">
              {["Board-certified physicians", "Specialized expertise", "Collaborative approach"].map((item, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mr-2 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 group">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 transform transition-transform group-hover:scale-110 group-hover:bg-primary/20 group-hover:rotate-3">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">24/7 Support</h3>
            <p className="text-gray-600 mb-6">We&apos;re available around the clock to provide care when you need it most, ensuring continuous support for your health concerns.</p>
            <ul className="space-y-2">
              {["Emergency assistance", "Online consultations", "Immediate responses"].map((item, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mr-2 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Additional features row */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex items-center group">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="text-lg font-medium mb-1 group-hover:text-primary transition-colors">Advanced Technology</h4>
              <p className="text-gray-600 text-sm">State-of-the-art equipment for accurate diagnosis and effective treatment.</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex items-center group">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="text-lg font-medium mb-1 group-hover:text-primary transition-colors">Affordable Care</h4>
              <p className="text-gray-600 text-sm">Transparent pricing and multiple payment options to suit your budget.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 