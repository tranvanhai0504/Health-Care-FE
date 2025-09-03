"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { prescriptionService, userService, medicineService } from "@/services";
import { Prescription, User, Medicine } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  FileText,
  Calendar,
  Pill,
  AlertCircle,
  Loader2,
  LogIn,
  Stethoscope,
  DollarSign,
  User as UserIcon,
  Phone,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface PrescriptionDetailModalProps {
  prescription: Prescription | null;
  isOpen: boolean;
  onClose: () => void;
}

function PrescriptionDetailModal({ prescription, isOpen, onClose }: PrescriptionDetailModalProps) {
  const { t } = useTranslation();
  const [doctorUser, setDoctorUser] = useState<User | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(false);
  const [isLoadingMedicines, setIsLoadingMedicines] = useState(false);

  useEffect(() => {
    if (prescription && isOpen) {
      fetchDoctorUserInfo();
      fetchMedicineInfo();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prescription, isOpen]);

  const fetchDoctorUserInfo = async () => {
    if (!prescription || typeof prescription.doctor === 'string') return;
    
    setIsLoadingDoctor(true);
    try {
      const doctorUserData = await userService.getById(prescription.doctor.user);
      setDoctorUser(doctorUserData);
    } catch (error) {
      console.error("Error fetching doctor user info:", error);
    } finally {
      setIsLoadingDoctor(false);
    }
  };

  const fetchMedicineInfo = async () => {
    if (!prescription) return;
    
    setIsLoadingMedicines(true);
    try {
      const medicineIds = prescription.medications.map(med => med.medicine);
      console.log('Debug - Fetching medicines for IDs:', medicineIds);
      
      const medicinePromises = medicineIds.map(async (id) => {
        try {
          console.log(`Debug - Fetching medicine with ID: ${id}`);
          const result = await medicineService.getById(id);
          console.log(`Debug - Medicine ${id} result:`, result);
          return result;
        } catch (error) {
          console.error(`Error fetching medicine ${id}:`, error);
          return null; // Return null for failed requests
        }
      });
      
      const medicineData: (Medicine | null)[] = await Promise.all(medicinePromises);
      console.log('Debug - All medicine data:', medicineData);
      
      // Filter out null values (failed requests)
      const validMedicines = medicineData.filter((medicine): medicine is Medicine => medicine !== null);
      console.log('Debug - Valid medicines:', validMedicines);
      
      setMedicines(validMedicines);
    } catch (error) {
      console.error("Error fetching medicine info:", error);
      setMedicines([]);
    } finally {
      setIsLoadingMedicines(false);
    }
  };

  if (!prescription) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
                     <DialogTitle className="flex items-center gap-2">
             <Pill className="h-5 w-5 text-primary" />
             {t("dashboard.prescriptions.details.title")}
           </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs font-medium text-gray-600">{t("dashboard.prescriptions.details.dateIssued")}</p>
                <p className="text-sm text-gray-900">
                  {format(new Date(prescription.dateIssued), "PPP")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs font-medium text-gray-600">{t("dashboard.prescriptions.details.totalCost")}</p>
                <p className="text-sm text-gray-900">
                  {prescription.totalCost.toLocaleString()} VND
                </p>
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="border border-gray-200 rounded-lg p-4">
                         <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
               <Stethoscope className="h-5 w-5 text-primary" />
               {t("dashboard.prescriptions.details.doctorInformation")}
             </h3>
            {typeof prescription.doctor === 'string' ? (
              <p className="text-gray-500">{t("dashboard.prescriptions.details.doctorId")}: {prescription.doctor}</p>
            ) : (
              <div className="space-y-4">
                {/* Doctor User Info */}
                {isLoadingDoctor ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">{t("dashboard.prescriptions.details.loadingDoctor")}</span>
                  </div>
                ) : doctorUser ? (
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-primary/5 rounded-lg">
                   <div className="flex items-center gap-2">
                     <UserIcon className="h-4 w-4 text-primary" />
                     <div>
                       <p className="text-xs font-medium text-gray-600">{t("dashboard.prescriptions.details.name")}</p>
                       <p className="text-sm text-gray-900 font-medium">{doctorUser.name}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <Phone className="h-4 w-4 text-primary" />
                     <div>
                       <p className="text-xs font-medium text-gray-600">{t("dashboard.prescriptions.details.phone")}</p>
                       <p className="text-sm text-gray-900 font-medium">{doctorUser.phoneNumber}</p>
                     </div>
                   </div>
                 </div>
                ) : (
                  <p className="text-sm text-gray-500">{t("dashboard.prescriptions.details.unableToLoadDoctor")}</p>
                )}

                {/* Doctor Professional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{t("dashboard.prescriptions.details.experience")}</p>
                    <p className="text-gray-900">{prescription.doctor.experience} years</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{t("dashboard.prescriptions.details.consultationFee")}</p>
                    <p className="text-gray-900">{prescription.doctor.consultationFee.toLocaleString()} VND</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-700">{t("dashboard.prescriptions.details.qualifications")}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {prescription.doctor.qualifications.map((qual, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {qual}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {prescription.doctor.bio && prescription.doctor.bio !== 'undefined' && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-700">{t("dashboard.prescriptions.details.bio")}</p>
                      <p className="text-gray-900">{prescription.doctor.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Diagnosis */}
          <div className="border border-gray-200 rounded-lg p-4">
                         <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
               <FileText className="h-5 w-5 text-primary" />
               {t("dashboard.prescriptions.details.diagnosis")}
             </h3>
             <p className="text-gray-900 bg-primary/5 p-3 rounded-md">
               {prescription.diagnosis}
             </p>
          </div>

          {/* Notes */}
          {prescription.notes && (
            <div className="border border-gray-200 rounded-lg p-4">
                           <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
               <AlertCircle className="h-5 w-5 text-primary" />
               {t("dashboard.prescriptions.details.notes")}
             </h3>
             <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
               {prescription.notes}
             </p>
            </div>
          )}

          {/* Medications */}
          <div className="border border-gray-200 rounded-lg p-4">
                         <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
               <Pill className="h-5 w-5 text-primary" />
               {t("dashboard.prescriptions.details.medications")} ({prescription.medications.length})
             </h3>
                         {isLoadingMedicines ? (
               <div className="flex items-center gap-2">
                 <Loader2 className="h-4 w-4 animate-spin" />
                 <span className="text-sm text-gray-500">{t("dashboard.prescriptions.details.loadingMedicines")}</span>
               </div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                   <thead>
                     <tr className="border-b border-gray-200">
                       <th className="text-left py-2 px-3 font-medium text-gray-700">{t("dashboard.prescriptions.details.medicine")}</th>
                       <th className="text-left py-2 px-3 font-medium text-gray-700">{t("dashboard.prescriptions.details.dosage")}</th>
                       <th className="text-left py-2 px-3 font-medium text-gray-700">{t("dashboard.prescriptions.details.form")}</th>
                       <th className="text-left py-2 px-3 font-medium text-gray-700">{t("dashboard.prescriptions.details.route")}</th>
                       <th className="text-left py-2 px-3 font-medium text-gray-700">{t("dashboard.prescriptions.details.quantity")}</th>
                       <th className="text-left py-2 px-3 font-medium text-gray-700">{t("dashboard.prescriptions.details.frequency")}</th>
                       <th className="text-left py-2 px-3 font-medium text-gray-700">{t("dashboard.prescriptions.details.duration")}</th>
                     </tr>
                   </thead>
                   <tbody>
                     {prescription.medications.map((medication, index) => {
                       const medicine = medicines.find(m => m && m._id === medication.medicine);
                       return (
                         <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50">
                           <td className="py-3 px-3">
                             <div className="font-medium text-gray-900">
                               {medicine ? medicine.name : `${t("dashboard.prescriptions.details.medicine")} ${index + 1}`}
                             </div>
                             {!medicine && (
                               <div className="text-xs text-yellow-600 mt-1">
                                 ID: {medication.medicine}
                               </div>
                             )}
                           </td>
                           <td className="py-3 px-3 text-gray-700">
                             {medicine ? medicine.dosage : '-'}
                           </td>
                           <td className="py-3 px-3 text-gray-700">
                             {medicine ? medicine.form : '-'}
                           </td>
                           <td className="py-3 px-3 text-gray-700">
                             {medicine ? medicine.route : '-'}
                           </td>
                           <td className="py-3 px-3">
                             <Badge variant="outline" className="text-xs">
                               {medication.quantity}
                             </Badge>
                           </td>
                           <td className="py-3 px-3 text-gray-700">
                             {medication.frequency || '-'}
                           </td>
                           <td className="py-3 px-3 text-gray-700">
                             {medication.duration || '-'}
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </div>
             )}
          </div>

          {/* Payment Status */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("dashboard.prescriptions.details.paymentStatus")}</h3>
            <Badge
              variant={prescription.isPaid ? "default" : "secondary"}
              className={prescription.isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
            >
              {prescription.isPaid ? t("dashboard.prescriptions.details.paid") : t("dashboard.prescriptions.details.pendingPayment")}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PrescriptionsPage() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch prescriptions when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPrescriptions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // Filter prescriptions based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPrescriptions(prescriptions);
    } else {
      const filtered = prescriptions.filter((prescription) =>
        prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPrescriptions(filtered);
    }
  }, [searchTerm, prescriptions]);

  const fetchPrescriptions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await prescriptionService.getPatientPrescriptions({ 
        patientId: user._id 
      });
      setPrescriptions(response);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrescriptionClick = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPrescription(null);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="container mx-auto">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto">
                 <div className="max-w-md mx-auto text-center">
           <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
             <LogIn className="h-8 w-8 text-primary" />
           </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("dashboard.prescriptions.accessTitle")}
          </h1>
          <p className="text-gray-600 mb-6">
            {t("dashboard.prescriptions.accessDescription")}
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/login">{t("dashboard.prescriptions.signIn")}</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/register">{t("dashboard.prescriptions.createAccount")}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
             <FileText className="h-5 w-5 text-primary" />
           </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("dashboard.prescriptions.title")}</h1>
            <p className="text-gray-600">
              {t("dashboard.prescriptions.subtitle")}
            </p>
          </div>
        </div>

        {/* Search Bar */}
                 <div className="relative max-w-md">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/60" />
          <Input
            type="text"
            placeholder={t("dashboard.prescriptions.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2"
          />
        </div>
      </div>

      {/* Prescriptions Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? t("dashboard.prescriptions.noPrescriptionsFound") : t("dashboard.prescriptions.noPrescriptionsYet")}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? t("dashboard.prescriptions.tryAdjustingSearch")
              : t("dashboard.prescriptions.prescriptionsWillAppear")
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrescriptions.map((prescription) => (
            <Card 
              key={prescription._id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handlePrescriptionClick(prescription)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {prescription.diagnosis}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(prescription.dateIssued), "MMM d, yyyy")}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Medications */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    {t("dashboard.prescriptions.medications")} ({prescription.medications.length})
                  </h4>
                  <div className="space-y-2">
                    {prescription.medications.slice(0, 2).map((med, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-gray-900">
                          {t("dashboard.prescriptions.medicine")} {index + 1}
                        </div>
                        <div className="text-gray-600 text-xs">
                          {t("dashboard.prescriptions.quantity")}: {med.quantity}
                        </div>
                      </div>
                    ))}
                    {prescription.medications.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{prescription.medications.length - 2} {t("dashboard.prescriptions.moreMedications")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {prescription.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {t("dashboard.prescriptions.notes")}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {prescription.notes}
                    </p>
                  </div>
                )}

                {/* Total Cost */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t("dashboard.prescriptions.totalCost")}:</span>
                    <span className="font-medium text-gray-900">
                      {prescription.totalCost.toLocaleString()} VND
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      {prescriptions.length > 0 && (
        <div className="mt-8 text-center">
          <Button
            onClick={fetchPrescriptions}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {t("dashboard.prescriptions.refreshPrescriptions")}
          </Button>
        </div>
      )}

      {/* Prescription Detail Modal */}
      <PrescriptionDetailModal
        prescription={selectedPrescription}
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
      />
    </div>
  );
}
