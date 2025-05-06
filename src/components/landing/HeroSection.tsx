export function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-primary/30 to-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
            Modern Healthcare Solutions
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Providing quality healthcare services to improve your wellbeing and quality of life
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/80 transition-colors">
              Book Appointment
            </button>
            <button className="px-6 py-3 bg-white text-primary font-medium rounded-md border border-primary hover:bg-primary hover:text-white transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 