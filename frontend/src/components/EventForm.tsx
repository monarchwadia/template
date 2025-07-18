import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventFormSchema } from "./eventFormSchema";

export interface EventFormFields {
  title: string;
  desc?: string;
  location?: string;
  startDt: string;
  endDt: string;
  timezone: string;
  publish: boolean;
}

interface EventFormProps {
  initialValues: Partial<EventFormFields>;
  onSubmit: (data: EventFormFields) => void | Promise<void>;
  submitLabel: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  onCancel?: () => void;
  cancelLabel?: string;
}

export const EventForm: React.FC<EventFormProps> = ({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  submitError,
  onCancel,
  cancelLabel = "Cancel",
}) => {
  const form = useForm<EventFormFields>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialValues,
  });
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  // Autofill handler for dev
  const handleAutofill = () => {
    setValue("title", "Sample Event Title");
    setValue(
      "desc",
      "This is a sample event description for development testing."
    );
    setValue("location", "Community Hall");
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000);
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    setValue("startDt", start.toISOString().slice(0, 16));
    setValue("endDt", end.toISOString().slice(0, 16));
    setValue("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
  };

  // Convert startDt and endDt to ISO string before submit
  const handleFormSubmit = (data: EventFormFields) => {
    const toIso = (val: string) => new Date(val).toISOString();
    onSubmit({
      ...data,
      startDt: toIso(data.startDt),
      endDt: toIso(data.endDt),
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="label">
          <span className="label-text">Title</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          {...register("title")}
          required
        />
        {errors?.title && (
          <span className="text-error text-xs">
            {errors.title?.message as string}
          </span>
        )}
      </div>
      <div>
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          className="textarea textarea-bordered w-full"
          {...register("desc")}
        />
        {errors?.desc && (
          <span className="text-error text-xs">
            {errors.desc?.message as string}
          </span>
        )}
      </div>
      <div>
        <label className="label">
          <span className="label-text">Location</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          {...register("location")}
        />
        {errors?.location && (
          <span className="text-error text-xs">
            {errors.location?.message as string}
          </span>
        )}
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="label">
            <span className="label-text">Start Date/Time</span>
          </label>
          <input
            type="datetime-local"
            className="input input-bordered w-full"
            {...register("startDt")}
            required
          />
          {errors?.startDt && (
            <span className="text-error text-xs">
              {errors.startDt?.message as string}
            </span>
          )}
        </div>
        <div className="flex-1">
          <label className="label">
            <span className="label-text">End Date/Time</span>
          </label>
          <input
            type="datetime-local"
            className="input input-bordered w-full"
            {...register("endDt")}
            required
          />
          {errors?.endDt && (
            <span className="text-error text-xs">
              {errors.endDt?.message as string}
            </span>
          )}
        </div>
      </div>
      <div>
        <label className="label">
          <span className="label-text">Timezone</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          {...register("timezone")}
          required
        />
        {errors?.timezone && (
          <span className="text-error text-xs">
            {errors.timezone?.message as string}
          </span>
        )}
      </div>
      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-4">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            {...register("publish")}
            defaultChecked={initialValues.publish ?? true}
          />
          <span className="label-text">Publish Event</span>
        </label>
      </div>
      {submitError && (
        <div className="alert alert-error mt-2">{submitError}</div>
      )}
      <div className="flex justify-end items-center gap-2 mt-4">
        {import.meta.env.DEV && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleAutofill}
          >
            Fill Sample Values
          </button>
        )}
        {onCancel && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </button>
        )}
        <button
          className="btn btn-primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
};
