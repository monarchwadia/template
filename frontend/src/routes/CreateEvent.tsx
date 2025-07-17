import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { useState } from "react";
import { useCreateCommunityEvent } from "../hooks/useCreateCommunityEvent";


const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  desc: z.string().optional(),
  location: z.string().optional(),
  startDt: z.string().min(1, "Start date/time is required"),
  endDt: z.string().min(1, "End date/time is required"),
  timezone: z.string().min(1, "Timezone is required"),
  publish: z.boolean()
});

type EventForm = z.infer<typeof eventSchema>;

export default function CreateEvent() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      publish: true
    }
  });

  const createEventMutation = useCreateCommunityEvent();

  const onSubmit = async (data: EventForm) => {
    setSubmitError(null);
    if (!slug) {
      setSubmitError("Community slug is missing");
      return;
    }
    try {
      // Convert datetime-local (YYYY-MM-DDTHH:mm) to ISO string with seconds and Z
      const toIso = (val: string) => {
        // treat as local time, convert to UTC
        const date = new Date(val);
        return date.toISOString();
      };
      await createEventMutation.mutateAsync({
        slug,
        ...data,
        startDt: toIso(data.startDt),
        endDt: toIso(data.endDt),
        publish: data.publish
      });
      navigate(`/c/${slug}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Failed to create event");
      }
      console.error(err);
    }
  };

  const isDev = import.meta.env.DEV;

  const handleAutofill = () => {
    setValue("title", "Sample Event Title");
    setValue("desc", "This is a sample event description for development testing.");
    setValue("location", "Community Hall");
    // Set startDt to now + 1 hour, endDt to now + 2 hours
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000);
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    setValue("startDt", start.toISOString().slice(0, 16));
    setValue("endDt", end.toISOString().slice(0, 16));
    setValue("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 card bg-base-100 shadow p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Event</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input type="text" className="input input-bordered w-full" {...register("title")}/>
          {errors.title && <span className="text-error text-xs">{errors.title.message}</span>}
        </div>
        <div>
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea className="textarea textarea-bordered w-full" {...register("desc")}/>
          {errors.desc && <span className="text-error text-xs">{errors.desc.message}</span>}
        </div>
        <div>
          <label className="label">
            <span className="label-text">Location</span>
          </label>
          <input type="text" className="input input-bordered w-full" {...register("location")}/>
          {errors.location && <span className="text-error text-xs">{errors.location.message}</span>}
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="label">
              <span className="label-text">Start Date/Time</span>
            </label>
            <input type="datetime-local" className="input input-bordered w-full" {...register("startDt")}/>
            {errors.startDt && <span className="text-error text-xs">{errors.startDt.message}</span>}
          </div>
          <div className="flex-1">
            <label className="label">
              <span className="label-text">End Date/Time</span>
            </label>
            <input type="datetime-local" className="input input-bordered w-full" {...register("endDt")}/>
            {errors.endDt && <span className="text-error text-xs">{errors.endDt.message}</span>}
          </div>
        </div>
        <div>
          <label className="label">
            <span className="label-text">Timezone</span>
          </label>
          <input type="text" className="input input-bordered w-full" {...register("timezone")}/>
          {errors.timezone && <span className="text-error text-xs">{errors.timezone.message}</span>}
        </div>
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-4">
            <input type="checkbox" className="toggle toggle-primary" defaultChecked {...register("publish")}/>
            <span className="label-text">Publish Event</span>
          </label>
        </div>
        {submitError && <div className="alert alert-error mt-2">{submitError}</div>}
        <div className="flex justify-end items-center gap-2 mt-4">
          {isDev && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleAutofill}
            >
              Dev: Autofill
            </button>
          )}
          <button className="btn btn-primary" type="submit" disabled={isSubmitting || createEventMutation.isPending}>
            {isSubmitting || createEventMutation.isPending ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
