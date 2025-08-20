"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Minus, Save, Pill } from "lucide-react";
import { CreatePrescriptionData, Medication } from "@/types/prescription";
import { Appointment } from "@/types/appointment";

interface PrescriptionFormProps {
  appointment?: Appointment;
  onSave: (data: CreatePrescriptionData) => Promise<void>;
  onCancel: () => void;
}

export function PrescriptionForm({
  appointment,
  onSave,
  onCancel,
}: PrescriptionFormProps) {
  const [formData, setFormData] = useState<CreatePrescriptionData>({
    patientId: appointment?.id || "",
    scheduleId: appointment?.id,
    medications: [
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ],
    diagnosis: "",
    notes: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleMedicationChange = (
    index: number,
    field: keyof Medication,
    value: string
  ) => {
    const newMedications = [...formData.medications];
    newMedications[index][field] = value;
    setFormData({ ...formData, medications: newMedications });
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [
        ...formData.medications,
        {
          name: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
        },
      ],
    });
  };

  const removeMedication = (index: number) => {
    const newMedications = formData.medications.filter((_, i) => i !== index);
    setFormData({ ...formData, medications: newMedications });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving prescription:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Create Prescription
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6 overflow-auto">
        {/* Patient Info */}
        {appointment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p><strong>Name:</strong> {appointment.patientName}</p>
                <p><strong>Phone:</strong> {appointment.patientPhone}</p>
                <p><strong>Date:</strong> {appointment.date}</p>
                <p><strong>Time:</strong> {appointment.time}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Diagnosis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Diagnosis</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.diagnosis}
              onChange={(e) =>
                setFormData({ ...formData, diagnosis: e.target.value })
              }
              placeholder="Enter diagnosis..."
              className="text-sm"
              rows={3}
              required
            />
          </CardContent>
        </Card>

        {/* Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              Medications
              <Button type="button" size="sm" variant="outline" onClick={addMedication}>
                <Plus className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.medications.map((medication, index) => (
              <div key={index} className="space-y-3 p-4 border rounded-md">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Medication {index + 1}</h4>
                  {formData.medications.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeMedication(index)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Medication Name</Label>
                    <Input
                      value={medication.name}
                      onChange={(e) =>
                        handleMedicationChange(index, "name", e.target.value)
                      }
                      placeholder="e.g., Paracetamol"
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Dosage</Label>
                    <Input
                      value={medication.dosage}
                      onChange={(e) =>
                        handleMedicationChange(index, "dosage", e.target.value)
                      }
                      placeholder="e.g., 500mg"
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Frequency</Label>
                    <Input
                      value={medication.frequency}
                      onChange={(e) =>
                        handleMedicationChange(index, "frequency", e.target.value)
                      }
                      placeholder="e.g., 3 times daily"
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Duration</Label>
                    <Input
                      value={medication.duration}
                      onChange={(e) =>
                        handleMedicationChange(index, "duration", e.target.value)
                      }
                      placeholder="e.g., 7 days"
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Instructions</Label>
                  <Textarea
                    value={medication.instructions || ""}
                    onChange={(e) =>
                      handleMedicationChange(index, "instructions", e.target.value)
                    }
                    placeholder="Special instructions (e.g., take with food, before meals)"
                    className="text-sm"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes or instructions..."
              className="text-sm"
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button type="submit" disabled={isSaving} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Prescription"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
