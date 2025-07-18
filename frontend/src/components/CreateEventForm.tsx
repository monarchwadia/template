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
      const toIso = (val: string) => {
        const date = new Date(val);
        return date.toISOString();
      };
      await createEventMutation.mutateAsync({
        slug,
        ...data,
        startDt: toIso(data.startDt),
        endDt: toIso(data.endDt),
        publish: !!data.publish,
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
      showPublishToggle={true}
    />
  );
};
