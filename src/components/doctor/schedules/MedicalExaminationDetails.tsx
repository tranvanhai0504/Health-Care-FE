"use client";

import { useState, useEffect } from "react";
import {
  PopulatedMedicalExamination,
  UpdateMedicalExaminationData,
} from "@/types/medicalExamination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { consultationServiceApi } from "@/services/consultationService.service";
import { ConsultationService } from "@/types";

import { useAuthStore } from "@/stores/auth";
import { doctorService } from "@/services/doctor.service";
import { DoctorWithPopulatedData } from "@/types/doctor";
import { Label } from "@/components/ui/label";
import { medicalExaminationService } from "@/services/medicalExamination.service";

import { useToast } from "@/hooks/useToast";

interface MedicalExaminationDetailsProps {
  examination: PopulatedMedicalExamination;
  onUpdate: (updatedExamination: PopulatedMedicalExamination) => void;
}

export function MedicalExaminationDetails({
  examination,
  onUpdate,
}: MedicalExaminationDetailsProps) {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [doctorProfile, setDoctorProfile] =
    useState<DoctorWithPopulatedData | null>(null);
  const [services, setServices] = useState<ConsultationService[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (user?._id) {
        try {
          const profile = await doctorService.findOneByUserId(user._id);
          setDoctorProfile(profile);
        } catch (error) {
          alert(error);
          console.error("Failed to fetch doctor profile:", error);
          toast({
            title: "Error",
            description: "Could not load doctor profile.",
          });
        }
      }
    };

    fetchDoctorProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

      if (typeof serviceIndex === "number" && formData.subclinicalResults?.[serviceIndex]) {
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
    <div>
      <div className="space-y-4">
        <div className="">
          <Label>Symptoms</Label>
          <div className="space-y-2 mt-2">
            {formData.symptoms?.map((symptom, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={symptom}
                  onChange={(e) => handleSymptomChange(index, e.target.value)}
                  placeholder={`Symptom #${index + 1}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeSymptom(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSymptom}
            >
              Add Symptom
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <div className="mt-4">
            <Label>Subclinical Results</Label>
            <div className="space-y-2 mt-2">
              {isLoading ? (
                <p>Loading results...</p>
              ) : (
                formData.subclinicalResults?.map((result, index) => {
                  const service = services.find(
                    (s) => s._id === result.service
                  );
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
                  const canEdit =
                    (isNew && canEditBySpecialization) || isAuthor;

                  return (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base flex justify-between items-center">
                          {service.name}
                          {canEdit && (
                            <Button
                              size="sm"
                              onClick={() => handleSave(index)}
                              disabled={isSaving}
                            >
                              {isSaving ? "Saving..." : "Save"}
                            </Button>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`resultData-${index}`}>
                            Result Data
                          </Label>
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
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
          <Label className="mt-4">Follow-Up</Label>
          <div className="space-y-2 mt-2">
            <Input
              name="nextVisit"
              type="date"
              value={formData.followUp?.nextVisit?.split("T")[0] || ""}
              onChange={handleFollowUpChange}
            />
            <Textarea
              name="notes"
              value={formData.followUp?.notes || ""}
              onChange={handleFollowUpChange}
              placeholder="Follow-up notes"
            />
          </div>
        </div>

        <div className="mt-4">
          <Label>Final Diagnosis</Label>
          <div className="space-y-2 mt-2">
            {formData.finalDiagnosis?.map((diag, index) => (
              <div key={index} className="p-2 border rounded-md space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    name="icdCode"
                    value={diag.icdCode}
                    onChange={(e) => handleDiagnosisChange(e, index)}
                    placeholder={`ICD-10 Code #${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeDiagnosis(index)}
                  >
                    Remove
                  </Button>
                </div>
                <Textarea
                  name="description"
                  value={diag.description}
                  onChange={(e) => handleDiagnosisChange(e, index)}
                  placeholder={`Description #${index + 1}`}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDiagnosis}
            >
              Add Diagnosis
            </Button>
          </div>
        </div>

        <Button onClick={() => handleSave()} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Examination"}
        </Button>
      </div>
    </div>
  );
}
