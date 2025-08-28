"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, Pill, Search } from "lucide-react";
import { CreatePrescriptionData } from "@/types/prescription";
import { medicineService } from "@/services";
import { Medicine } from "@/types";

// Local interface for form data
interface FormMedication {
  medicineId: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
}

interface FormData {
  patient: string;
  diagnosis: string;
  notes: string;
  medications: FormMedication[];
  totalCost: number;
}

interface CreatePrescriptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CreatePrescriptionData) => Promise<void>;
  patientId: string;
  patientName?: string;
  trigger?: React.ReactNode;
}

export function CreatePrescriptionDialog({
  isOpen,
  onOpenChange,
  onSave,
  patientId,
  patientName,
  trigger,
}: CreatePrescriptionDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    patient: patientId,
    diagnosis: "",
    notes: "",
    medications: [],
    totalCost: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoadingMedicines, setIsLoadingMedicines] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMedicines = useCallback(async () => {
    setIsLoadingMedicines(true);
    try {
      const response = await medicineService.getAll({
        limit: 100, // Get more medicines for better selection
        ...(searchTerm && { name: searchTerm })
      });
      setMedicines(response || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setMedicines([]);
    } finally {
      setIsLoadingMedicines(false);
    }
  }, [searchTerm]);

  // Fetch medicines when component mounts
  useEffect(() => {
    if (isOpen) {
      fetchMedicines();
    }
  }, [isOpen, fetchMedicines]);

  // Ensure patient field is always set correctly when dialog opens
  useEffect(() => {
    if (isOpen && patientId) {
      setFormData(prev => ({
        ...prev,
        patient: patientId
      }));
    }
  }, [isOpen, patientId]);

  // Safety check: if patient field is empty but we have patientId, restore it
  useEffect(() => {
    if ((!formData.patient || formData.patient.trim() === '') && patientId) {
      setFormData(prev => ({
        ...prev,
        patient: patientId
      }));
    }
  }, [formData, patientId]);

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      patient: prev.patient || patientId, // Ensure patient is preserved
      medications: [
        ...prev.medications,
        {
          medicineId: "",
          name: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
          quantity: 1,
        }
      ]
    }));
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      patient: prev.patient || patientId, // Ensure patient is preserved
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index: number, field: keyof FormMedication, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      patient: prev.patient || patientId, // Ensure patient is preserved
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const handleMedicineSelect = (index: number, medicineId: string) => {
    const selectedMedicine = medicines.find(med => med._id === medicineId);
    if (selectedMedicine) {
      setFormData(prev => ({
        ...prev,
        patient: prev.patient || patientId, // Ensure patient is preserved
        medications: prev.medications.map((med, i) => 
          i === index ? { 
            ...med, 
            medicineId: selectedMedicine._id || "",
            name: selectedMedicine.name,
            dosage: selectedMedicine.dosage 
          } : med
        )
      }));
    }
  };

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      try {
        const response = await medicineService.searchByName(value, { limit: 50 });
        setMedicines(response || []);
      } catch (error) {
        console.error('Error searching medicines:', error);
      }
    } else {
      fetchMedicines();
    }
  };

  // Calculate total cost based on medications
  const calculateTotalCost = (medications: FormMedication[]): number => {
    // For now, we'll use a simple calculation
    // In a real app, you might want to fetch actual medicine prices
    return medications.reduce((total, med) => {
      if (med.medicineId && med.quantity) {
        // Base cost per medicine (you might want to fetch this from the API)
        const baseCost = 1000; // 1000 VND per medicine
        return total + (baseCost * med.quantity);
      }
      return total;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate that patient field is not empty
    if (!formData.patient || formData.patient.trim() === '') {
      alert('Patient information is missing. Please try again.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Transform the data to match API format
      const apiData: CreatePrescriptionData = {
        patient: formData.patient,
        diagnosis: formData.diagnosis,
        notes: formData.notes,
        totalCost: calculateTotalCost(formData.medications),
        medications: formData.medications.map(med => ({
          medicine: med.medicineId,
          quantity: med.quantity || 1,
          frequency: med.frequency,
          duration: med.duration
        }))
      };

      await onSave(apiData);
      // Reset form after successful save
      setFormData({
        patient: patientId,
        diagnosis: "",
        notes: "",
        medications: [],
        totalCost: 0,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving prescription:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      patient: patientId,
      diagnosis: "",
      notes: "",
      medications: [],
      totalCost: 0,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Create Prescription
          </DialogTitle>
          <DialogDescription>
            {patientName ? `Create prescription for ${patientName}` : 'Create a new prescription'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Medications Section - First Order */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">Medications</Label>
                {formData.medications.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.medications.filter(med => med.medicineId).length} of {formData.medications.length} medicines selected
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMedication}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </div>

            {formData.medications.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Pill className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2">No medications added yet</p>
                <p className="text-xs text-gray-400">Click &quot;Add Medication&quot; to start creating the prescription</p>
              </div>
            )}

            {formData.medications.map((medication, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-lg">Medication {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMedication(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="">
                    <Label htmlFor={`medicine-${index}`}>Select Medicine *</Label>
                    <Select
                      onValueChange={(value) => handleMedicineSelect(index, value)}
                      value={medication.medicineId || ""}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose a medicine" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search medicines..."
                              value={searchTerm}
                              onChange={(e) => handleSearch(e.target.value)}
                              className="pl-8"
                            />
                          </div>
                        </div>
                        {isLoadingMedicines ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Loading medicines...
                          </div>
                        ) : medicines.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No medicines found
                          </div>
                        ) : (
                          medicines.map((medicine) => (
                            <SelectItem key={medicine._id} value={medicine._id || ""}>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{medicine.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {medicine.dosage} • {medicine.form} • {medicine.route}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {medication.medicineId ? (
                      <p className="text-xs text-green-600 mt-2">✓ Medicine selected</p>
                    ) : (
                      <p className="text-xs text-red-500 mt-2">Please select a medicine</p>
                    )}
                  </div>

                  <div className="mt-1">
                    <Label htmlFor={`dosage-${index}`}>Dosage *</Label>
                    <Input
                      id={`dosage-${index}`}
                      value={medication.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      placeholder="e.g., 500mg"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div className="mt-2">
                    <Label htmlFor={`frequency-${index}`}>Frequency *</Label>
                    <Input
                      id={`frequency-${index}`}
                      value={medication.frequency}
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                      placeholder="e.g., 3 times daily"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div className="mt-2">
                    <Label htmlFor={`duration-${index}`}>Duration *</Label>
                    <Input
                      id={`duration-${index}`}
                      value={medication.duration}
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      placeholder="e.g., 7 days"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div className="mt-2">
                    <Label htmlFor={`quantity-${index}`}>Quantity *</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      value={medication.quantity}
                      onChange={(e) => updateMedication(index, 'quantity', parseInt(e.target.value) || 1)}
                      placeholder="e.g., 10"
                      required
                      className="mt-2"
                      min="1"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor={`instructions-${index}`}>Instructions *</Label>
                  <Textarea
                    id={`instructions-${index}`}
                    value={medication.instructions}
                    onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                    placeholder="e.g., Take with food, avoid dairy products"
                    required
                    className="mt-2"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Diagnosis Section */}
          <div className="space-y-4">
            <Label htmlFor="diagnosis" className="text-base font-semibold">Diagnosis *</Label>
            <Textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
              placeholder="Enter the patient's diagnosis..."
              required
              rows={3}
            />
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <Label htmlFor="notes" className="text-base font-semibold">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Enter additional notes, follow-up instructions, or special considerations..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-3">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting || formData.medications.length === 0 || 
                formData.medications.some(med => !med.medicineId)}
              className="min-w-[120px]"
            >
              {isSubmitting ? "Creating..." : "Create Prescription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
