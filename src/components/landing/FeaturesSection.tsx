"use client";

import { Heart, Award, Clock, CheckCircle, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FeaturesSection() {
  const { t } = useTranslation();
  
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative">
        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="text-center mb-12 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t("landing.features.title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t("landing.features.description")}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 relative z-10">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 group">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 transform transition-transform group-hover:scale-110 group-hover:bg-primary/20 group-hover:rotate-3">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{t("landing.features.patientCenteredCare.title")}</h3>
            <p className="text-gray-600 mb-6">{t("landing.features.patientCenteredCare.description")}</p>
            <ul className="space-y-2">
              {[t("landing.features.patientCenteredCare.personalizedPlans"), t("landing.features.patientCenteredCare.compassionateCare"), t("landing.features.patientCenteredCare.patientEducation")].map((item, i) => (
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
            <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{t("landing.features.expertSpecialists.title")}</h3>
            <p className="text-gray-600 mb-6">{t("landing.features.expertSpecialists.description")}</p>
            <ul className="space-y-2">
              {[t("landing.features.expertSpecialists.boardCertified"), t("landing.features.expertSpecialists.specializedExpertise"), t("landing.features.expertSpecialists.collaborativeApproach")].map((item, i) => (
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
            <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{t("landing.features.support24x7.title")}</h3>
            <p className="text-gray-600 mb-6">{t("landing.features.support24x7.description")}</p>
            <ul className="space-y-2">
              {[t("landing.features.support24x7.emergencyAssistance"), t("landing.features.support24x7.onlineConsultations"), t("landing.features.support24x7.immediateResponses")].map((item, i) => (
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
              <h4 className="text-lg font-medium mb-1 group-hover:text-primary transition-colors">{t("landing.features.advancedTechnology.title")}</h4>
              <p className="text-gray-600 text-sm">{t("landing.features.advancedTechnology.description")}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex items-center group">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="text-lg font-medium mb-1 group-hover:text-primary transition-colors">{t("landing.features.affordableCare.title")}</h4>
              <p className="text-gray-600 text-sm">{t("landing.features.affordableCare.description")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 