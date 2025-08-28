"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { CreatePrescriptionData, PrescriptionMedication } from "@/types/prescription";

interface PrescriptionFormProps {
  onSave: (data: CreatePrescriptionData) => Promise<void>;
  onCancel: () => void;
  patientId: string;
}

export function PrescriptionForm({ onSave, onCancel, patientId }: PrescriptionFormProps) {
  const [formData, setFormData] = useState<{
    patient: string;
    diagnosis: string;
    notes: string;
    medications: PrescriptionMedication[];
    totalCost: number;
  }>({
    patient: patientId,
    diagnosis: "",
    notes: "",
    medications: [],
    totalCost: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total cost based on medications
  const calculateTotalCost = (medications: PrescriptionMedication[]): number => {
    // For now, we'll use a simple calculation
    // In a real app, you might want to fetch actual medicine prices
    return medications.reduce((total, med) => {
      if (med.quantity) {
        // Base cost per medicine (you might want to fetch this from the API)
        const baseCost = 1000; // 1000 VND per medicine
        return total + (baseCost * med.quantity);
      }
      return total;
    }, 0);
  };

  const addMedication = () => {
    setFormData(prev => {
      const newMedications = [
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
      ];
      return {
        ...prev,
        medications: newMedications,
        totalCost: calculateTotalCost(newMedications),
      };
    });
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index: number, field: keyof PrescriptionMedication, value: string | number) => {
    setFormData(prev => {
      const updatedMedications = prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      );
      return {
        ...prev,
        medications: updatedMedications,
        totalCost: calculateTotalCost(updatedMedications),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Transform the data to match API format
      const apiData: CreatePrescriptionData = {
        patient: formData.patient,
        diagnosis: formData.diagnosis,
        notes: formData.notes,
        totalCost: formData.totalCost,
        medications: formData.medications.map(med => ({
          medicine: med.medicineId,
          quantity: med.quantity,
          frequency: med.frequency,
          duration: med.duration
        }))
      };
      
      await onSave(apiData);
    } catch (error) {
      console.error('Error saving prescription:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="diagnosis">Diagnosis</Label>
          <Textarea
            id="diagnosis"
            value={formData.diagnosis}
            onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
            placeholder="Enter diagnosis..."
            required
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Enter additional notes..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Medications</Label>
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
          <p className="text-sm text-gray-500 text-center py-4">
            No medications added yet. Click &quot;Add Medication&quot; to start.
          </p>
        )}

        {formData.medications.map((medication, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Medication {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeMedication(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`name-${index}`}>Medication Name</Label>
                <Input
                  id={`name-${index}`}
                  value={medication.name}
                  onChange={(e) => updateMedication(index, 'name', e.target.value)}
                  placeholder="e.g., Amoxicillin"
                  required
                />
              </div>

              <div>
                <Label htmlFor={`dosage-${index}`}>Dosage</Label>
                <Input
                  id={`dosage-${index}`}
                  value={medication.dosage}
                  onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                  placeholder="e.g., 500mg"
                  required
                />
              </div>

              <div>
                <Label htmlFor={`frequency-${index}`}>Frequency</Label>
                <Input
                  id={`frequency-${index}`}
                  value={medication.frequency}
                  onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                  placeholder="e.g., 3 times daily"
                  required
                />
              </div>

              <div>
                <Label htmlFor={`duration-${index}`}>Duration</Label>
                <Input
                  id={`duration-${index}`}
                  value={medication.duration}
                  onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                  placeholder="e.g., 7 days"
                  required
                />
              </div>

              <div>
                <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                <Input
                  id={`quantity-${index}`}
                  type="number"
                  min="1"
                  value={medication.quantity}
                  onChange={(e) => updateMedication(index, 'quantity', parseInt(e.target.value) || 1)}
                  placeholder="1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`instructions-${index}`}>Instructions</Label>
              <Textarea
                id={`instructions-${index}`}
                value={medication.instructions}
                onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                placeholder="e.g., Take with food"
                required
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting || formData.medications.length === 0}
          className="flex-1"
        >
          {isSubmitting ? "Saving..." : "Save Prescription"}
        </Button>
      </div>
    </div>
  );
}
