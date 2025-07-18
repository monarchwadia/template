import React from "react";
import { useUpdateCalendarEvent } from "../hooks/useUpdateCalendarEvent";
import { EventForm, type EventFormFields } from "./EventForm";
interface EditEventFormProps {
  event: {
    id: string;
    title: string;
    desc?: string | null;
    location?: string | null;
    startDt: string;
    endDt: string;
    timezone?: string | null;
    publish?: boolean;
  };
  onCancel: () => void;
  onSuccess: () => void;
}

export const EditEventForm: React.FC<EditEventFormProps> = ({
  event,
  onCancel,
  onSuccess,
}) => {
  const updateMutation = useUpdateCalendarEvent();

  const initialValues = {
    title: event.title,
    desc: event.desc || "",
    location: event.location || "",
    startDt: new Date(event.startDt).toISOString().slice(0, 16),
    endDt: new Date(event.endDt).toISOString().slice(0, 16),
    timezone: event.timezone || "UTC",
    publish: event.publish ?? true,
  };

  const handleSubmit = (data: EventFormFields) => {
    updateMutation.mutate(
      {
        eventId: event.id,
        ...data,
      },
      {
        onSuccess,
      }
    );
  };

  return (
    <div className="max-w-xl mx-auto mt-10 card bg-base-100 shadow p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Edit Event</h2>
      </div>
      <EventForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel={updateMutation.isPending ? "Updating..." : "Update Event"}
        isSubmitting={updateMutation.isPending}
        submitError={
          updateMutation.error ? updateMutation.error.message : undefined
        }
        onCancel={onCancel}
        cancelLabel="Cancel"
        showPublishToggle={true}
      />
      {updateMutation.isSuccess && (
        <div className="alert alert-success mt-4">
          Event updated successfully!
        </div>
      )}
    </div>
  );
};
