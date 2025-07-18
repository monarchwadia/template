import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useCreateCommunityEvent } from "../hooks/useCreateCommunityEvent";
import { EventForm, type EventFormFields } from "./EventForm";

export const CreateEventForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createEventMutation = useCreateCommunityEvent();

  const initialValues: EventFormFields = {
    title: "",
    desc: "",
    location: "",
    startDt: "",
    endDt: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    publish: true,
  };

  const handleSubmit = async (data: EventFormFields) => {
    setSubmitError(null);
    if (!slug) {
      setSubmitError("Community slug is missing");
      return;
    }
    try {
      await createEventMutation.mutateAsync({
        slug,
        ...data,
      });
      navigate(`/c/${slug}`);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Failed to create event");
      }
    }
  };

  return (
    <EventForm
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitLabel="Create Event"
      isSubmitting={createEventMutation.isPending}
      submitError={submitError}
    />
  );
};
