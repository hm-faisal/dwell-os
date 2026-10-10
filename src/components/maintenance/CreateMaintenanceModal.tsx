"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PhotoUploadField } from "@/components/ui/PhotoUploadField";
import { maintenanceApi } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type {
  MaintenanceCategory,
  MaintenanceUrgency,
} from "@/types/maintenance";

export interface CreateMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  onSuccess?: () => void;
}

export function CreateMaintenanceModal({
  isOpen,
  onClose,
  roomId,
  roomName,
  onSuccess,
}: CreateMaintenanceModalProps) {
  const [category, setCategory] = useState<MaintenanceCategory>("PLUMBING");
  const [urgency, setUrgency] = useState<MaintenanceUrgency>("MEDIUM");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 10) {
      showToast.error("Description must be at least 10 characters long");
      return;
    }

    try {
      setIsSubmitting(true);
      await maintenanceApi.create(roomId, {
        category,
        urgency,
        description: description.trim(),
        photos,
      });

      showToast.success("Maintenance ticket submitted!", {
        description:
          "The landlord has been notified. You can track progress on the maintenance board.",
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create ticket";
      showToast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Report Maintenance: ${roomName}`}
      description="Submit an issue report with photos and urgency rating for prompt resolution."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label
              htmlFor="ticket-category"
              className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
            >
              Category
            </label>
            <select
              id="ticket-category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as MaintenanceCategory)
              }
              className="w-full px-3 py-2 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10 text-zinc-950 dark:text-zinc-50"
            >
              <option value="PLUMBING">🚰 Plumbing</option>
              <option value="ELECTRICAL">⚡ Electrical</option>
              <option value="HVAC">❄️ HVAC / Heating</option>
              <option value="APPLIANCE">🍳 Appliance</option>
              <option value="STRUCTURAL">🧱 Structural</option>
              <option value="OTHER">📦 Other</option>
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="ticket-urgency"
              className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
            >
              Urgency
            </label>
            <select
              id="ticket-urgency"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as MaintenanceUrgency)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10 text-zinc-950 dark:text-zinc-50"
            >
              <option value="LOW">Low - Flexible</option>
              <option value="MEDIUM">Medium - Normal</option>
              <option value="HIGH">High - Urgent</option>
              <option value="EMERGENCY">🚨 Emergency</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="ticket-desc"
            className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
          >
            Description of Issue *
          </label>
          <textarea
            id="ticket-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of what is leaking, broken, or not working..."
            required
            className="w-full p-3 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10 text-zinc-950 dark:text-zinc-50"
          />
        </div>

        <div className="space-y-1.5">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Attach Evidence Photos
          </span>
          <PhotoUploadField
            value={photos}
            onChange={setPhotos}
            maxPhotos={3}
            label="Upload Issue Photos"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/5 dark:border-white/5">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
          >
            Submit Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
}
