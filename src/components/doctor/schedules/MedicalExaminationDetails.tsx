"use client";

import { useState, useEffect } from "react";
import {
  PopulatedMedicalExamination,
  UpdateMedicalExaminationData,
} from "@/types/medicalExamination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { consultationServiceApi } from "@/services/consultationService.service";
import { ConsultationService } from "@/types";

import { DoctorWithPopulatedData } from "@/types/doctor";
import { Label } from "@/components/ui/label";
import { medicalExaminationService } from "@/services/medicalExamination.service";

import { useToast } from "@/hooks/useToast";
import React from "react";

import {
  ClipboardList,
  FileText,
  Beaker,
  CalendarPlus,
  PlusCircle,
  XCircle,
  Save,
} from "lucide-react";

interface MedicalExaminationDetailsProps {
  examination: PopulatedMedicalExamination;
  onUpdate: (updatedExamination: PopulatedMedicalExamination) => void;
  doctorProfile: DoctorWithPopulatedData;
}

export function MedicalExaminationDetails({
  examination,
  onUpdate,
  doctorProfile,
}: MedicalExaminationDetailsProps) {
  const { toast } = useToast();

  const [services, setServices] = useState<ConsultationService[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<UpdateMedicalExaminationData>({});

  useEffect(() => {
    const initializeFormData = async () => {
      setIsLoading(true);
      try {
        const serviceIds =
          examination.services?.map((s) =>
            typeof s === "string" ? s : s._id
          ) || [];
        if (serviceIds.length > 0) {
          const fetchedServices = await consultationServiceApi.getByIds(
            serviceIds
          );
          setServices(fetchedServices);

          const existingResults = examination.subclinicalResults || [];
          const mergedResults = fetchedServices.map((service) => {
            const existingResult = existingResults.find((r) => {
              const resultServiceId =
                typeof r.service === "string" ? r.service : r.service?._id;
              return resultServiceId === service._id;
            });
            return {
              service: service._id,
              resultData: existingResult?.resultData || "",
              notes: existingResult?.notes || "",
              performedAt: existingResult?.performedAt || new Date(),
              performedBy: existingResult?.performedBy?._id,
            };
          });

          setFormData({
            symptoms: examination.symptoms,
            finalDiagnosis: examination.finalDiagnosis || [],
            followUp: examination.followUp || {},
            subclinicalResults: mergedResults,
          });
        } else {
          setFormData({
            symptoms: examination.symptoms,
            finalDiagnosis: examination.finalDiagnosis || [],
            followUp: examination.followUp || {},
            subclinicalResults: [],
          });
        }
      } catch (error) {
        console.error("Failed to fetch services for examination:", error);
        toast({
          title: "Error",
          description: "Could not load services for examination.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeFormData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examination]);
  const [isSaving, setIsSaving] = useState(false);

  console.log("formData", formData);

  const handleSymptomChange = (index: number, value: string) => {
    const newSymptoms = [...(formData.symptoms || [])];
    newSymptoms[index] = value;
    setFormData((prev) => ({ ...prev, symptoms: newSymptoms }));
  };

  const addSymptom = () => {
    setFormData((prev) => ({
      ...prev,
      symptoms: [...(prev.symptoms || []), ""],
    }));
  };

  const removeSymptom = (index: number) => {
    const newSymptoms = [...(formData.symptoms || [])];
    newSymptoms.splice(index, 1);
    setFormData((prev) => ({ ...prev, symptoms: newSymptoms }));
  };

  const handleDiagnosisChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    const newDiagnosis = [...(formData.finalDiagnosis || [])];
    if (!newDiagnosis[index]) {
      newDiagnosis[index] = { icdCode: "", description: "" };
    }
    newDiagnosis[index] = { ...newDiagnosis[index], [name]: value };
    setFormData((prev) => ({ ...prev, finalDiagnosis: newDiagnosis }));
  };

  const addDiagnosis = () => {
    setFormData((prev) => ({
      ...prev,
      finalDiagnosis: [
        ...(prev.finalDiagnosis || []),
        { icdCode: "", description: "" },
      ],
    }));
  };

  const removeDiagnosis = (index: number) => {
    const newDiagnosis = [...(formData.finalDiagnosis || [])];
    newDiagnosis.splice(index, 1);
    setFormData((prev) => ({ ...prev, finalDiagnosis: newDiagnosis }));
  };
  const handleFollowUpChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      followUp: { ...(prev.followUp || {}), [name]: value },
    }));
  };

  const handleSubclinicalResultChange = (
    index: number,
    field: "resultData" | "notes",
    value: string
  ) => {
    const newResults = [...(formData.subclinicalResults || [])];
    if (newResults[index]) {
      const updatedResult = { ...newResults[index], [field]: value };
      if (!updatedResult.performedBy && doctorProfile?._id) {
        updatedResult.performedBy = doctorProfile._id;
      }
      newResults[index] = updatedResult;
      setFormData((prev) => ({ ...prev, subclinicalResults: newResults }));
    }
  };

  const handleSave = async (serviceIndex?: number) => {
    setIsSaving(true);
    try {
      let updateData: UpdateMedicalExaminationData = formData;

      if (
        typeof serviceIndex === "number" &&
        formData.subclinicalResults?.[serviceIndex]
      ) {
        updateData = {
          subclinicalResults: [formData.subclinicalResults[serviceIndex]],
        };
      }

      await medicalExaminationService.update(examination._id, updateData);
      const updatedExamination =
        await medicalExaminationService.getByIdPopulated(examination._id);
      onUpdate(updatedExamination);
      toast({
        title: "Success",
        description: "Medical examination updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update medical examination:", error);
      toast({
        title: "Error",
        description: "Failed to update medical examination.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5" />
          Symptoms
        </h3>
        <div className="space-y-4">
          {formData.symptoms && formData.symptoms.length > 0 ? (
            formData.symptoms.map((symptom, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={symptom}
                  onChange={(e) => handleSymptomChange(index, e.target.value)}
                  placeholder={`Symptom #${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSymptom(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">
              No symptoms added yet.
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSymptom}
            className="flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Add Symptom
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Beaker className="w-5 h-5" />
          Subclinical Results
        </h3>
        <div className="space-y-4">
          {isLoading ? (
            <p>Loading results...</p>
          ) : formData.subclinicalResults &&
            formData.subclinicalResults.length > 0 ? (
            formData.subclinicalResults.map((result, index) => {
              const service = services.find((s) => s._id === result.service);
              if (!service) return null;

              const serviceSpecialization = (
                service as ConsultationService & {
                  specialization?: { _id: string };
                }
              ).specialization?._id;
              const canEditBySpecialization =
                !serviceSpecialization ||
                doctorProfile?.specialization._id === serviceSpecialization;

              const isAuthor = result.performedBy === doctorProfile?._id;
              const isNew = !result.performedBy;
              const canEdit = (isNew && canEditBySpecialization) || isAuthor;

              return (
                <div
                  key={index}
                  className="p-4 border rounded-md space-y-4 bg-gray-50/50"
                >
                  <h4 className="font-semibold flex justify-between items-center">
                    {service.name}
                    {canEdit && (
                      <Button
                        size="sm"
                        onClick={() => handleSave(index)}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                    )}
                  </h4>
                  <div className="space-y-2">
                    <Label htmlFor={`resultData-${index}`}>Result Data</Label>
                    <Textarea
                      id={`resultData-${index}`}
                      value={result.resultData || ""}
                      onChange={(e) =>
                        handleSubclinicalResultChange(
                          index,
                          "resultData",
                          e.target.value
                        )
                      }
                      placeholder="Enter result data"
                      disabled={!canEdit || isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`notes-${index}`}>Notes</Label>
                    <Textarea
                      id={`notes-${index}`}
                      value={result.notes || ""}
                      onChange={(e) =>
                        handleSubclinicalResultChange(
                          index,
                          "notes",
                          e.target.value
                        )
                      }
                      placeholder="Enter notes"
                      disabled={!canEdit || isSaving}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground text-sm">
              No subclinical results available.
            </p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5" />
          Final Diagnosis
        </h3>
        <div className="space-y-4">
          {formData.finalDiagnosis && formData.finalDiagnosis.length > 0 ? (
            formData.finalDiagnosis.map((diag, index) => (
              <div
                key={index}
                className="p-4 border rounded-md space-y-4 bg-gray-50/50"
              >
                <div className="flex items-center gap-2">
                  <Input
                    name="icdCode"
                    value={diag.icdCode}
                    onChange={(e) => handleDiagnosisChange(e, index)}
                    placeholder={`ICD-10 Code #${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDiagnosis(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>
                <Textarea
                  name="description"
                  value={diag.description}
                  onChange={(e) => handleDiagnosisChange(e, index)}
                  placeholder={`Description #${index + 1}`}
                />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">
              No diagnosis added yet.
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDiagnosis}
            className="flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Add Diagnosis
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <CalendarPlus className="w-5 h-5" />
          Follow-Up
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="nextVisit">Next Visit</Label>
            <Input
              id="nextVisit"
              name="nextVisit"
              type="date"
              className="w-fit mt-2"
              value={formData.followUp?.nextVisit?.split("T")[0] || ""}
              onChange={handleFollowUpChange}
            />
          </div>
          <div>
            <Label htmlFor="followUpNotes">Notes</Label>
            <Textarea
              id="followUpNotes"
              name="notes"
              className="w-fit mt-2"
              value={formData.followUp?.notes || ""}
              onChange={handleFollowUpChange}
              placeholder="Follow-up notes"
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button
          onClick={() => handleSave()}
          disabled={isSaving}
          className="w-full flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Examination"}
        </Button>
      </div>
    </div>
  );
}
