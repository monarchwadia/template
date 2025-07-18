import { CreateEventForm } from "../components/CreateEventForm";

export default function CreateEvent() {
  return (
    <div className="max-w-xl mx-auto mt-10 card bg-base-100 shadow p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Event</h1>
      </div>
      <CreateEventForm />
    </div>
  );
}
