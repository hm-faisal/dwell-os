"use client";

import { useEffect, useState } from "react";
import { applicationsApi } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type {
  ApplicationDocumentUpload,
  ApplicationEmployment,
  ApplicationPersonalInfo,
  ApplicationReference,
  RoomApplicationSubmissionPayload,
} from "@/lib/validations/roomApplication";

export interface UseRoomApplicationProps {
  roomId: string;
  roomName: string;
  rentCents: number;
  initialHoldExpiresAt?: string | null;
  onSuccess?: (applicationId: string) => void;
}

export function useRoomApplication({
  roomId,
  roomName,
  rentCents,
  initialHoldExpiresAt,
  onSuccess,
}: UseRoomApplicationProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  // Step 1: Personal details & Move-in
  const [personalInfo, setPersonalInfo] = useState<ApplicationPersonalInfo>({
    fullName: "",
    email: "",
    phone: "",
    currentAddress: "",
    dateOfBirth: "",
  });
  const [requestedMoveInDate, setRequestedMoveInDate] = useState<string>("");
  const [intendedStayMonths, setIntendedStayMonths] = useState<number>(12);

  // Step 2: Employment & References
  const [employment, setEmployment] = useState<ApplicationEmployment>({
    employerName: "",
    jobTitle: "",
    employmentStatus: "FULL_TIME",
    monthlyIncomeCents: Math.round(rentCents * 3), // default 3x rent rule of thumb
    supervisorContact: "",
  });
  const [references, setReferences] = useState<ApplicationReference[]>([
    {
      name: "",
      relationship: "Previous Landlord",
      email: "",
      phone: "",
    },
  ]);
  const [emergencyContact, setEmergencyContact] = useState({
    name: "",
    phone: "",
    relationship: "Parent / Guardian",
  });

  // Step 3: Required documents
  const [documents, setDocuments] = useState<ApplicationDocumentUpload[]>([]);

  // Step 4: Notes & Agreement
  const [notes, setNotes] = useState<string>("");
  const [agreedToHoldPolicy, setAgreedToHoldPolicy] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedApplicationId, setSubmittedApplicationId] = useState<
    string | null
  >(null);

  // Active Hold Countdown Timer
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(
    initialHoldExpiresAt || null,
  );
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isHoldExpired, setIsHoldExpired] = useState<boolean>(false);

  // Fallback unique idempotency key generator
  const [idempotencyKey] = useState<string>(() => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  });

  // Active hold countdown ticker
  useEffect(() => {
    if (!holdExpiresAt) {
      setRemainingSeconds(null);
      setIsHoldExpired(false);
      return;
    }

    const targetTime = new Date(holdExpiresAt).getTime();

    const updateTimer = () => {
      const diff = Math.floor((targetTime - Date.now()) / 1000);
      if (diff <= 0) {
        setRemainingSeconds(0);
        setIsHoldExpired(true);
      } else {
        setRemainingSeconds(diff);
        setIsHoldExpired(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  const addReference = () => {
    setReferences((prev) => [
      ...prev,
      { name: "", relationship: "Colleague", email: "", phone: "" },
    ]);
  };

  const removeReference = (index: number) => {
    if (references.length <= 1) return;
    setReferences((prev) => prev.filter((_, i) => i !== index));
  };

  const updateReference = (
    index: number,
    patch: Partial<ApplicationReference>,
  ) => {
    setReferences((prev) =>
      prev.map((ref, i) => (i === index ? { ...ref, ...patch } : ref)),
    );
  };

  const addDocument = (doc: ApplicationDocumentUpload) => {
    setDocuments((prev) => [...prev, doc]);
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // Step validations
  const validateStep1 = () => {
    if (!personalInfo.fullName.trim() || !personalInfo.email.trim()) {
      showToast.error("Please enter your full name and email");
      return false;
    }
    if (!requestedMoveInDate) {
      showToast.error("Please select your requested move-in date");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!employment.employerName.trim() || !employment.jobTitle.trim()) {
      showToast.error("Please provide your employer name and current role");
      return false;
    }
    if (!employment.monthlyIncomeCents || employment.monthlyIncomeCents <= 0) {
      showToast.error("Please enter a valid monthly income");
      return false;
    }
    const hasValidRef = references.some((r) => r.name.trim() && r.phone.trim());
    if (!hasValidRef) {
      showToast.error(
        "Please provide at least one reference with a contact number",
      );
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (documents.length === 0) {
      showToast.error(
        "Please upload at least one verification document (e.g., photo ID or paystub)",
      );
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const submitApplication = async () => {
    if (!agreedToHoldPolicy) {
      showToast.error("Please agree to the priority reservation hold terms");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: RoomApplicationSubmissionPayload = {
        roomId,
        requestedMoveInDate: new Date(requestedMoveInDate).toISOString(),
        intendedStayMonths,
        personalInfo,
        employment,
        references: references.filter((r) => r.name.trim()),
        documents,
        emergencyContact,
        notes: notes.trim() || undefined,
        idempotencyKey,
      };

      // Calls idempotent backend application submission endpoint
      const createdApp = await applicationsApi.create({
        roomId: payload.roomId,
        moveInDate: payload.requestedMoveInDate,
        employment: `${payload.employment.employerName} - ${payload.employment.jobTitle} (${payload.employment.employmentStatus})`,
        personalInfo: JSON.stringify(payload.personalInfo),
        references: JSON.stringify(payload.references),
        notes: payload.notes,
        documents: payload.documents.map((d) => ({
          name: d.name,
          type: d.type,
          fileUrl: d.fileUrl,
        })),
      });

      // Default hold duration is 48 hours if not provided by backend
      const expirationTimestamp =
        createdApp.holdExpiresAt ||
        new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

      setHoldExpiresAt(expirationTimestamp);
      setSubmittedApplicationId(createdApp.id);

      showToast.success(`Priority Reservation Hold Active for ${roomName}!`, {
        description:
          "The room has been locked against competing bookings for the duration of the hold countdown.",
      });

      onSuccess?.(createdApp.id);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit application";
      showToast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number | null) => {
    if (seconds === null) return "--:--:--";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    setCurrentStep,
    personalInfo,
    setPersonalInfo,
    requestedMoveInDate,
    setRequestedMoveInDate,
    intendedStayMonths,
    setIntendedStayMonths,
    employment,
    setEmployment,
    references,
    addReference,
    removeReference,
    updateReference,
    emergencyContact,
    setEmergencyContact,
    documents,
    addDocument,
    removeDocument,
    notes,
    setNotes,
    agreedToHoldPolicy,
    setAgreedToHoldPolicy,
    isSubmitting,
    submitApplication,
    holdExpiresAt,
    remainingSeconds,
    isHoldExpired,
    formatTimer,
    submittedApplicationId,
  };
}
