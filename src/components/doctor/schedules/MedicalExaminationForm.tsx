"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Minus, Save, Calendar } from "lucide-react";
import {
  CreateMedicalExaminationData,
  FinalDiagnosis,
  SubclinicalResult,
  FollowUp,
} from "@/types/medicalExamination";
import { Appointment } from "@/types/appointment";

interface MedicalExaminationFormProps {
  appointment?: Appointment;
  onSave: (data: CreateMedicalExaminationData) => Promise<void>;
  onCancel: () => void;
}

export function MedicalExaminationForm({
  appointment,
  onSave,
  onCancel,
}: MedicalExaminationFormProps) {
  const [formData, setFormData] = useState<CreateMedicalExaminationData>({
    patient: appointment?.id || "",
    examinationDate: new Date().toISOString().split("T")[0],
    symptoms: appointment?.symptoms ? [appointment.symptoms] : [],
    subclinicalResults: [],
    services: [],
    finalDiagnosis: [],
    followUp: {},
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSymptomChange = (index: number, value: string) => {
    const newSymptoms = [...formData.symptoms];
    newSymptoms[index] = value;
    setFormData({ ...formData, symptoms: newSymptoms });
  };

  const addSymptom = () => {
    setFormData({
      ...formData,
      symptoms: [...formData.symptoms, ""],
    });
  };

  const removeSymptom = (index: number) => {
    const newSymptoms = formData.symptoms.filter((_, i) => i !== index);
    setFormData({ ...formData, symptoms: newSymptoms });
  };

  const handleDiagnosisChange = (index: number, field: keyof FinalDiagnosis, value: string) => {
    const newDiagnosis = [...(formData.finalDiagnosis || [])];
    if (!newDiagnosis[index]) {
      newDiagnosis[index] = { icdCode: "", description: "" };
    }
    newDiagnosis[index][field] = value;
    setFormData({ ...formData, finalDiagnosis: newDiagnosis });
  };

  const addDiagnosis = () => {
    setFormData({
      ...formData,
      finalDiagnosis: [
        ...(formData.finalDiagnosis || []),
        { icdCode: "", description: "" },
      ],
    });
  };

  const removeDiagnosis = (index: number) => {
    const newDiagnosis = (formData.finalDiagnosis || []).filter((_, i) => i !== index);
    setFormData({ ...formData, finalDiagnosis: newDiagnosis });
  };

  const handleSubclinicalChange = (
    index: number,
    field: keyof SubclinicalResult,
    value: string
  ) => {
    const newResults = [...(formData.subclinicalResults || [])];
    if (!newResults[index]) {
      newResults[index] = {
        service: "",
        resultData: "",
        performedAt: new Date().toISOString(),
      };
    }
    newResults[index][field] = value as never;
    setFormData({ ...formData, subclinicalResults: newResults });
  };

  const addSubclinicalResult = () => {
    setFormData({
      ...formData,
      subclinicalResults: [
        ...(formData.subclinicalResults || []),
        {
          service: "",
          resultData: "",
          performedAt: new Date().toISOString(),
        },
      ],
    });
  };

  const removeSubclinicalResult = (index: number) => {
    const newResults = (formData.subclinicalResults || []).filter((_, i) => i !== index);
    setFormData({ ...formData, subclinicalResults: newResults });
  };

  const handleFollowUpChange = (field: keyof FollowUp, value: string) => {
    setFormData({
      ...formData,
      followUp: {
        ...formData.followUp,
        [field]: value,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving medical examination:", error);
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
            <Calendar className="h-4 w-4" />
            Medical Examination
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

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Examination Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="examinationDate" className="text-xs">
                Examination Date
              </Label>
              <Input
                id="examinationDate"
                type="date"
                value={formData.examinationDate}
                onChange={(e) =>
                  setFormData({ ...formData, examinationDate: e.target.value })
                }
                className="h-8 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Symptoms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              Symptoms
              <Button type="button" size="sm" variant="outline" onClick={addSymptom}>
                <Plus className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {formData.symptoms.map((symptom, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={symptom}
                  onChange={(e) => handleSymptomChange(index, e.target.value)}
                  placeholder="Enter symptom"
                  className="h-8 text-sm flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => removeSymptom(index)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Final Diagnosis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              Final Diagnosis
              <Button type="button" size="sm" variant="outline" onClick={addDiagnosis}>
                <Plus className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(formData.finalDiagnosis || []).map((diagnosis, index) => (
              <div key={index} className="space-y-2 p-3 border rounded-md">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">ICD Code</Label>
                    <Input
                      value={diagnosis.icdCode}
                      onChange={(e) =>
                        handleDiagnosisChange(index, "icdCode", e.target.value)
                      }
                      placeholder="e.g., J44.1"
                      className="h-8 text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeDiagnosis(index)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={diagnosis.description}
                    onChange={(e) =>
                      handleDiagnosisChange(index, "description", e.target.value)
                    }
                    placeholder="Diagnosis description"
                    className="text-sm"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Subclinical Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              Subclinical Results
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addSubclinicalResult}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(formData.subclinicalResults || []).map((result, index) => (
              <div key={index} className="space-y-2 p-3 border rounded-md">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">Service ID</Label>
                    <Input
                      value={result.service}
                      onChange={(e) =>
                        handleSubclinicalChange(index, "service", e.target.value)
                      }
                      placeholder="Service ID"
                      className="h-8 text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeSubclinicalResult(index)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
                <div>
                  <Label className="text-xs">Result Data</Label>
                  <Textarea
                    value={result.resultData}
                    onChange={(e) =>
                      handleSubclinicalChange(index, "resultData", e.target.value)
                    }
                    placeholder="Test results"
                    className="text-sm"
                    rows={2}
                  />
                </div>
                <div>
                  <Label className="text-xs">Performed At</Label>
                  <Input
                    type="datetime-local"
                    value={result.performedAt?.toString().slice(0, 16)}
                    onChange={(e) =>
                      handleSubclinicalChange(index, "performedAt", e.target.value)
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Notes</Label>
                  <Input
                    value={result.notes || ""}
                    onChange={(e) =>
                      handleSubclinicalChange(index, "notes", e.target.value)
                    }
                    placeholder="Additional notes"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Follow Up */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Follow Up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nextVisit" className="text-xs">
                Next Visit Date
              </Label>
              <Input
                id="nextVisit"
                type="date"
                value={formData.followUp?.nextVisit || ""}
                onChange={(e) => handleFollowUpChange("nextVisit", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="followUpNotes" className="text-xs">
                Follow Up Notes
              </Label>
              <Textarea
                id="followUpNotes"
                value={formData.followUp?.notes || ""}
                onChange={(e) => handleFollowUpChange("notes", e.target.value)}
                placeholder="Follow up instructions..."
                className="text-sm"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button type="submit" disabled={isSaving} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Examination"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
