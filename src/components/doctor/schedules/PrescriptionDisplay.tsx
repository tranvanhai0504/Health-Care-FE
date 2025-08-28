"use client";

import { useState, useEffect } from "react";
import { prescriptionService, medicineService } from "@/services";
import { Prescription, Medicine } from "@/types";
import { Pill, FileText, DollarSign, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PrescriptionDisplayProps {
  prescriptionId: string;
}

export function PrescriptionDisplay({ prescriptionId }: PrescriptionDisplayProps) {
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMedicines, setIsLoadingMedicines] = useState(false);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    const fetchPrescription = async () => {
             try {
         setIsLoading(true);
         const data = await prescriptionService.getById(prescriptionId);
         setPrescription(data);
        
        // Fetch medicine data after prescription is loaded
        if (data && data.medications.length > 0) {
          fetchMedicineInfo(data.medications);
        }
      } catch (err) {
        console.error("Error fetching prescription:", err);
        setError("Failed to load prescription");
      } finally {
        setIsLoading(false);
      }
    };

    if (prescriptionId) {
      fetchPrescription();
         } else {
       setIsLoading(false);
       setError("No prescription ID provided");
     }
  }, [prescriptionId]);

  const fetchMedicineInfo = async (medications: { medicine: string }[]) => {
    if (!medications || medications.length === 0) return;
    
    setIsLoadingMedicines(true);
         try {
       const medicineIds = medications.map(med => med.medicine);
       
       const medicinePromises = medicineIds.map(async (id) => {
         try {
           const result = await medicineService.getById(id);
           return result;
         } catch (error) {
           console.error(`Error fetching medicine ${id}:`, error);
           return null; // Return null for failed requests
         }
       });
       
       const medicineData: (Medicine | null)[] = await Promise.all(medicinePromises);
       
       // Filter out null values (failed requests)
       const validMedicines = medicineData.filter((medicine): medicine is Medicine => medicine !== null);
       
       setMedicines(validMedicines);
    } catch (error) {
      console.error("Error fetching medicine info:", error);
      setMedicines([]);
    } finally {
      setIsLoadingMedicines(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-500">Loading prescription...</div>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-red-500">
          {error || "Prescription not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Pill className="h-5 w-5 text-primary" />
        <h4 className="text-lg font-semibold text-gray-900">Prescription Details</h4>
      </div>



      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-xs font-medium text-gray-600">Date Issued</p>
            <p className="text-sm text-gray-900">
              {new Date(prescription.dateIssued).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-xs font-medium text-gray-600">Total Cost</p>
            <p className="text-sm text-gray-900">
              {prescription.totalCost.toLocaleString()} VND
            </p>
          </div>
        </div>
      </div>

      {/* Diagnosis */}
      {prescription.diagnosis && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-primary" />
            <h5 className="text-sm font-medium text-gray-700">Diagnosis</h5>
          </div>
          <p className="text-sm text-gray-900 bg-primary/5 p-3 rounded-md">
            {prescription.diagnosis}
          </p>
        </div>
      )}

      {/* Notes */}
      {prescription.notes && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-primary" />
            <h5 className="text-sm font-medium text-gray-700">Notes</h5>
          </div>
          <p className="text-sm text-gray-900 bg-primary/5 p-3 rounded-md">
            {prescription.notes}
          </p>
        </div>
      )}

      {/* Medications */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Pill className="h-4 w-4 text-primary" />
          <h5 className="text-sm font-medium text-gray-700">Medications</h5>
        </div>
        {isLoadingMedicines ? (
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">Loading medicine information...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Medicine</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Dosage</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Form</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Route</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Quantity</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Frequency</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Duration</th>
                </tr>
              </thead>
              <tbody>
                                 {prescription.medications.map((medication, index) => {
                   const medicine = medicines.find(m => m && m._id === medication.medicine);
                   
                   return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-3">
                        <div className="font-medium text-gray-900">
                          {medicine ? medicine.name : `Medicine ${index + 1}`}
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
      <div className="flex items-center gap-2">
        <Badge
          variant={prescription.isPaid ? "default" : "secondary"}
          className={prescription.isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
        >
          {prescription.isPaid ? "Paid" : "Pending Payment"}
        </Badge>
      </div>
    </div>
  );
}
