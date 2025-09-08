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
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";
import SearchService from "@/components/dialogs/search-service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ClipboardList,
  FileText,
  Beaker,
  CalendarPlus,
  PlusCircle,
  XCircle,
  Save,
} from "lucide-react";
import { scheduleService } from "@/services/schedule.service";
import { getScheduleDate } from "@/utils";

// Import ICD service and types
import { icdService } from "@/services/icd.service";
import { ICD } from "@/types/icd";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";


interface MedicalExaminationDetailsProps {
  examination: PopulatedMedicalExamination;
  onUpdate: (updatedExamination: PopulatedMedicalExamination) => void;
  doctorProfile: DoctorWithPopulatedData;
  disabled?: boolean;
}

export function MedicalExaminationDetails({
  examination,
  onUpdate,
  doctorProfile,
  disabled = false,
}: MedicalExaminationDetailsProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [services, setServices] = useState<ConsultationService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<UpdateMedicalExaminationData>({});

  // Follow-up local UI state
  const [followUpEnabled, setFollowUpEnabled] = useState<boolean>(
    !!examination.followUp
  );
  const [followUpNotes, setFollowUpNotes] = useState<string>(
    examination.followUp?.notes || ""
  );
  const [followUpDate, setFollowUpDate] = useState<string>(""); // YYYY-MM-DD
  const [followUpTimeOffset, setFollowUpTimeOffset] = useState<"0" | "1">("0");
  const [followUpServiceDialogOpen, setFollowUpServiceDialogOpen] =
    useState(false);
  const [followUpSelectedServices, setFollowUpSelectedServices] = useState<
    ConsultationService[]
  >([]);
  const [isEditingFollowUp, setIsEditingFollowUp] = useState<boolean>(false);
  const [existingFollowUpData, setExistingFollowUpData] = useState<{
    date: string;
    timeOffset: "0" | "1";
    services: ConsultationService[];
    notes: string;
  } | null>(null);

  useEffect(() => {
    const fetchFollowUp = async () => {
      if (examination.followUp) {
        const scheduleFollowUp = await scheduleService.getById(
          examination.followUp.schedule as string
        );

        setFollowUpEnabled(true);
        setFollowUpNotes(examination.followUp.notes || "");
        const date = getScheduleDate(
          scheduleFollowUp.weekPeriod,
          scheduleFollowUp.dayOffset
        );

        const followUpDateStr = date.toISOString() || "";
        setFollowUpDate(followUpDateStr);
        setFollowUpTimeOffset(
          scheduleFollowUp.timeOffset.toString() as "0" | "1"
        );
        const followUpServices =
          scheduleFollowUp.services?.map((s) => s.service) || [];
        setFollowUpSelectedServices(followUpServices);

        // Store existing follow-up data for display
        setExistingFollowUpData({
          date: followUpDateStr,
          timeOffset: scheduleFollowUp.timeOffset.toString() as "0" | "1",
          services: followUpServices,
          notes: examination.followUp.notes || "",
        });
      }
    };

    fetchFollowUp();
  }, [examination.followUp]);

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
  }, [examination, t, toast]);

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
    index: number,
    field: "icd" | "description",
    value: ICD | string
  ) => {
    const newDiagnosis = [...(formData.finalDiagnosis || [])];
    if (!newDiagnosis[index]) {
      newDiagnosis[index] = { icdCode: "", description: "" };
    }
    
    if (field === "icd") {
      const icd = value as ICD;
      newDiagnosis[index] = { 
        ...newDiagnosis[index], 
        icdCode: icd.code,
        icdId: icd._id,
        description: icd.title
      };
    } else {
      newDiagnosis[index] = { 
        ...newDiagnosis[index], 
        [field]: value as string 
      };
    }
    
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
  // Removed old generic follow-up change handler in favor of explicit local state

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
      let updateData: UpdateMedicalExaminationData = structuredClone(formData);

      if (
        typeof serviceIndex === "number" &&
        formData.subclinicalResults?.[serviceIndex]
      ) {
        updateData = {
          subclinicalResults: [formData.subclinicalResults[serviceIndex]],
        };
      }

      delete updateData.followUp;

      await medicalExaminationService.update(examination._id, updateData);

      // Handle follow-up creation when enabled
      if (followUpEnabled) {
        if (!formData.followUp?.schedule) {
          const patientId =
            typeof examination.patient === "string"
              ? examination.patient
              : examination.patient?._id;

          let weekFromISO: string | undefined = undefined;
          let weekToISO: string | undefined = undefined;
          let dayOffset: number | undefined = undefined;
          if (followUpDate) {
            const selected = new Date(followUpDate);
            const weekPeriod = scheduleService.getWeekPeriod(selected);
            weekFromISO = weekPeriod.from.toISOString();
            weekToISO = weekPeriod.to.toISOString();
            // derive dayOffset based on UTC difference from week start
            dayOffset = Math.floor(
              (selected.getTime() - weekPeriod.from.getTime()) /
                (24 * 60 * 60 * 1000)
            );
          }

          await medicalExaminationService.createFollowUp(examination._id, {
            notes: followUpNotes || undefined,
            schedule: {
              userId: patientId as string,
              dayOffset: dayOffset ?? 0,
              timeOffset: parseInt(followUpTimeOffset, 10),
              services: followUpSelectedServices.map((s) => s._id),
              weekPeriod:
                weekFromISO && weekToISO
                  ? { from: weekFromISO, to: weekToISO }
                  : undefined,
            },
          });
        } else {
          let weekFromISO: Date | undefined = undefined;
          let weekToISO: Date | undefined = undefined;
          let dayOffset: number | undefined = undefined;
          if (followUpDate) {
            const selected = new Date(followUpDate);
            const weekPeriod = scheduleService.getWeekPeriod(selected);
            weekFromISO = weekPeriod.from;
            weekToISO = weekPeriod.to;
            // derive dayOffset based on UTC difference from week start
            dayOffset = Math.floor(
              (selected.getTime() - weekPeriod.from.getTime()) /
                (24 * 60 * 60 * 1000)
            );
          }

          await scheduleService.update(formData.followUp?.schedule as string, {
            weekPeriod:
              weekFromISO && weekToISO
                ? { from: weekFromISO, to: weekToISO }
                : undefined,
            dayOffset: dayOffset ?? 0,
            timeOffset: parseInt(followUpTimeOffset, 10) as 0 | 1,
            services: followUpSelectedServices.map((s) => s._id),
          });
        }

        setIsEditingFollowUp(false);
      }

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
          {t("doctor.medicalExamination.symptoms")}
        </h3>
        <div className="space-y-4">
          {formData.symptoms && formData.symptoms.length > 0 ? (
            formData.symptoms.map((symptom, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={symptom}
                  onChange={(e) => handleSymptomChange(index, e.target.value)}
                  placeholder={`${t("doctor.medicalExamination.symptoms")} #${index + 1}`}
                  disabled={disabled}
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
              {t("doctor.medicalExamination.noSymptomsAdded")}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSymptom}
            className="flex items-center gap-2"
            disabled={disabled}
          >
            <PlusCircle className="w-4 h-4" />
            {t("doctor.medicalExamination.addSymptom")}
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Beaker className="w-5 h-5" />
          {t("doctor.medicalExamination.subclinicalResults")}
        </h3>
        <div className="space-y-4">
          {isLoading ? (
            <p>{t("doctor.schedules.loading")}</p>
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
              const canEdit = ((isNew && canEditBySpecialization) || isAuthor) && !disabled;

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
                    <Label htmlFor={`resultData-${index}`}>{t("doctor.medicalExamination.resultData")}</Label>
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
                      placeholder={t("doctor.medicalExamination.enterResultData")}
                      disabled={!canEdit || isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`notes-${index}`}>{t("doctor.medicalExamination.notes")}</Label>
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
                      placeholder={t("doctor.medicalExamination.enterNotes")}
                      disabled={!canEdit || isSaving}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground text-sm">
              {t("doctor.medicalExamination.noSubclinicalResults")}
            </p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5" />
          {t("doctor.medicalExamination.finalDiagnosis")}
        </h3>
        <div className="space-y-4">
          {formData.finalDiagnosis && Array.isArray(formData.finalDiagnosis) && formData.finalDiagnosis.length > 0 ? (
            formData.finalDiagnosis.map((diag, index) => (
              <div
                key={index}
                className="p-4 border rounded-md space-y-4 bg-gray-50/50"
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <ICDSelector
                      value={(diag.icdId && diag.icdCode) ? { _id: diag.icdId, code: diag.icdCode || "", title: diag.description || "", range: "", createdAt: "", updatedAt: "" } as ICD : 
                             (diag.icdCode ? { _id: "", code: diag.icdCode || "", title: diag.description || "", range: "", createdAt: "", updatedAt: "" } as ICD : null)}
                      onValueChange={(icd) => icd && handleDiagnosisChange(index, "icd", icd)}
                      placeholder={t("doctor.medicalExamination.icdCodePlaceholder", { number: index + 1 })}
                      disabled={disabled}
                    />
                  </div>
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
                  value={diag.description || ""}
                  onChange={(e) => handleDiagnosisChange(index, "description", e.target.value)}
                  placeholder={t("doctor.medicalExamination.descriptionPlaceholder", { number: index + 1 })}
                  disabled={disabled}
                />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">
              {t("doctor.medicalExamination.noDiagnosisAdded")}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDiagnosis}
            className="flex items-center gap-2"
            disabled={disabled}
          >
            <PlusCircle className="w-4 h-4" />
            {t("doctor.medicalExamination.addDiagnosis")}
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <CalendarPlus className="w-5 h-5" />
          {t("doctor.medicalExamination.followUp")}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={followUpEnabled}
              onCheckedChange={(checked) => setFollowUpEnabled(!!checked)}
              disabled={disabled}
            />
            <span className="text-sm">{t("doctor.medicalExamination.enableFollowUp")}</span>
          </div>

          {followUpEnabled && (
            <>
              {/* Information Board for existing follow-up */}
              {existingFollowUpData && !isEditingFollowUp ? (
                <div className="space-y-4 p-4 border rounded-md bg-blue-50/50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-primary">
                      {t("doctor.medicalExamination.followUpInformation")}
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingFollowUp(true)}
                      className="text-primary border-primary hover:bg-primary/10"
                      disabled={disabled}
                    >
                      {t("doctor.medicalExamination.editFollowUp")}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-primary">
                        {t("dialog.scheduleDetail.date")}
                      </Label>
                      <p className="text-sm text-primary mt-1">
                        {new Date(
                          existingFollowUpData.date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-primary">
                        {t("dialog.scheduleDetail.time")}
                      </Label>
                      <p className="text-sm text-primary mt-1">
                        {existingFollowUpData.timeOffset === "0"
                          ? t("dialog.scheduleDetail.morning")
                          : t("dialog.scheduleDetail.afternoon")}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm font-medium text-primary">
                        {t("doctor.schedules.services")}
                      </Label>
                      <div className="mt-1 space-y-2">
                        {existingFollowUpData.services.length > 0 ? (
                          existingFollowUpData.services.map(
                            (service, index) => (
                              <div
                                key={index}
                                className="bg-white p-2 rounded border border-gray-200"
                              >
                                <p className="text-sm font-medium text-primary">
                                  {service.name}
                                </p>
                                {service.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {service.description}
                                  </p>
                                )}
                              </div>
                            )
                          )
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {t("doctor.medicalExamination.noServicesSelected")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {existingFollowUpData.notes && (
                    <div>
                      <Label className="text-sm font-medium text-primary">
                        {t("doctor.medicalExamination.followUpNotes")}
                      </Label>
                      <p className="text-sm text-primary mt-1 bg-white p-2 rounded border">
                        {existingFollowUpData.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Edit Form */
                <div className="space-y-4 p-4 border rounded-md bg-gray-50/50">
                  {existingFollowUpData && (
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">{t("doctor.medicalExamination.editFollowUp")}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingFollowUp(false)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        {t("doctor.medicalExamination.cancelEdit")}
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="followUpDate">{t("dialog.scheduleDetail.date")}</Label>
                      <Input
                        id="followUpDate"
                        type="date"
                        className="mt-2"
                        value={followUpDate.split("T")[0]}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        disabled={disabled}
                      />
                    </div>
                    <div>
                      <Label>{t("dialog.scheduleDetail.time")}</Label>
                      <Select
                          value={followUpTimeOffset}
                          onValueChange={(v) =>
                            setFollowUpTimeOffset(v as "0" | "1")
                          }
                          disabled={disabled}
                        >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder={t("doctor.medicalExamination.selectTime")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">{t("dialog.scheduleDetail.morning")}</SelectItem>
                          <SelectItem value="1">{t("dialog.scheduleDetail.afternoon")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t("doctor.schedules.services")}</Label>
                      <div className="mt-2">
                        <SearchService
                          isOpen={followUpServiceDialogOpen}
                          onOpenChange={setFollowUpServiceDialogOpen}
                          onApply={(selected) =>
                            setFollowUpSelectedServices(selected)
                          }
                          multiple={true}
                          trigger={
                            <Button
                              variant="outline"
                              type="button"
                              className="w-full justify-between"
                            >
                              {followUpSelectedServices.length > 0
                                ? `${followUpSelectedServices.length} ${t("doctor.medicalExamination.serviceSelected")}`
                                : t("doctor.medicalExamination.selectServices")}
                            </Button>
                          }
                          initialSelectedIds={followUpSelectedServices.map(
                            (s) => s._id
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="followUpNotes">{t("doctor.medicalExamination.followUpNotes")}</Label>
                    <Textarea
                    id="followUpNotes"
                    className="mt-2"
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    placeholder={t("doctor.medicalExamination.enterFollowUpNotes")}
                    disabled={disabled}
                  />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Button
          onClick={() => handleSave()}
          disabled={isSaving || disabled}
          className="w-full flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? t("doctor.medicalExamination.saving") : t("doctor.medicalExamination.saveExamination")}
        </Button>
      </div>
    </div>
  );
}

interface ICDSelectorProps {
  value: ICD | null;
  onValueChange: (value: ICD | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ICDSelector = React.forwardRef<
  React.ElementRef<typeof PopoverTrigger>,
  ICDSelectorProps
>(({ value, onValueChange, placeholder, disabled }, ref) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [icdResults, setIcdResults] = useState<ICD[]>([]);
  const [allIcds, setAllIcds] = useState<ICD[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all ICD codes when popover opens
  useEffect(() => {
    if (open && allIcds.length === 0) {
      const fetchAllICDs = async () => {
        setLoading(true);
        try {
          // Fetch all ICD codes with a reasonable limit
          const results = await icdService.getAll({ limit: 1000 });
          // Ensure results.data is an array before setting state
          if (results && Array.isArray(results.data)) {
            setAllIcds(results.data);
            // If there's no search term, show all ICDs
            if (search.length === 0) {
              setIcdResults(results.data);
            }
          } else {
            setAllIcds([]);
            setIcdResults([]);
          }
        } catch (error) {
          console.error("Failed to fetch all ICD codes:", error);
          setAllIcds([]);
          setIcdResults([]);
        } finally {
          setLoading(false);
        }
      };

      fetchAllICDs();
    } else if (open && allIcds.length > 0 && icdResults.length === 0) {
      // If we already have all ICDs but no results are displayed, show all ICDs
      setIcdResults(allIcds);
    }
  }, [open, allIcds, search, icdResults.length]);

  // Filter ICD codes based on search term when all ICDs are loaded
  useEffect(() => {
    if (allIcds.length > 0) {
      if (search.length === 0) {
        setIcdResults(allIcds);
      } else {
        const filtered = allIcds.filter(
          (icd) =>
            icd.code.toLowerCase().includes(search.toLowerCase()) ||
            icd.title.toLowerCase().includes(search.toLowerCase())
        );
        setIcdResults(filtered);
      }
    }
  }, [search, allIcds]);

  // Safety check for value
  const displayValue = value && value.code && value.title 
    ? `${value.code} - ${value.title}` 
    : (value && value.code 
        ? `${value.code}${value.title ? ` - ${value.title}` : ''}` 
        : (placeholder || "Select ICD code..."));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {displayValue}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search ICD codes..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading ? (
              <CommandEmpty>Searching...</CommandEmpty>
            ) : (icdResults && icdResults.length > 0) ? (
              <CommandGroup>
                {icdResults.map((icd) => (
                  <CommandItem
                    key={icd._id}
                    value={`${icd.code} - ${icd.title}`}
                    onSelect={() => {
                      onValueChange(icd);
                      setOpen(false);
                    }}
                  >
                    <div className="flex flex-col w-full">
                      <span className="font-medium">{icd.code}</span>
                      <span className="text-sm text-muted-foreground truncate">{icd.title}</span>
                    </div>
                    {value && value._id === icd._id && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandEmpty>No ICD codes found.</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

ICDSelector.displayName = "ICDSelector";
