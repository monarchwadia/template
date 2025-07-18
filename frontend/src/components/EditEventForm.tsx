import React, { useState } from "react";
import { useUpdateCalendarEvent } from "../hooks/useUpdateCalendarEvent";

interface EditEventFormProps {
  event: {
    id: string;
    title: string;
    desc?: string | null;
    location?: string | null;
    startDt: string;
    endDt: string;
    timezone?: string | null;
  };
  onCancel: () => void;
  onSuccess: () => void;
}

export const EditEventForm: React.FC<EditEventFormProps> = ({
  event,
  onCancel,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: event.title,
    desc: event.desc || "",
    location: event.location || "",
    startDt: new Date(event.startDt).toISOString().slice(0, 16),
    endDt: new Date(event.endDt).toISOString().slice(0, 16),
    timezone: event.timezone || "UTC",
  });

  const updateMutation = useUpdateCalendarEvent();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      {
        eventId: event.id,
        title: formData.title,
        desc: formData.desc || undefined,
        location: formData.location || undefined,
        startDt: formData.startDt,
        endDt: formData.endDt,
        timezone: formData.timezone,
      },
      {
        onSuccess: () => {
          onSuccess();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Title *</span>
        </label>
        <input
          type="text"
          className="input input-bordered"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          className="textarea textarea-bordered"
          rows={3}
          value={formData.desc}
          onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Location</span>
        </label>
        <input
          type="text"
          className="input input-bordered"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Start Date & Time *</span>
          </label>
          <input
            type="datetime-local"
            className="input input-bordered"
            value={formData.startDt}
            onChange={(e) =>
              setFormData({ ...formData, startDt: e.target.value })
            }
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">End Date & Time *</span>
          </label>
          <input
            type="datetime-local"
            className="input input-bordered"
            value={formData.endDt}
            onChange={(e) =>
              setFormData({ ...formData, endDt: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Timezone</span>
        </label>
        <select
          className="select select-bordered"
          value={formData.timezone}
          onChange={(e) =>
            setFormData({ ...formData, timezone: e.target.value })
          }
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Paris">Paris</option>
          <option value="Asia/Tokyo">Tokyo</option>
          <option value="Asia/Shanghai">Shanghai</option>
          <option value="Australia/Sydney">Sydney</option>
        </select>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onCancel}
          disabled={updateMutation.isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? "Updating..." : "Update Event"}
        </button>
      </div>

      {updateMutation.error && (
        <div className="alert alert-error">
          Error updating event: {updateMutation.error.message}
        </div>
      )}

      {updateMutation.isSuccess && (
        <div className="alert alert-success">Event updated successfully!</div>
      )}
    </form>
  );
};
