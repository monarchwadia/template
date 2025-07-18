import z from "zod";

export const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  desc: z.string().optional(),
  location: z.string().optional(),
  startDt: z.string().min(1, "Start date/time is required"),
  endDt: z.string().min(1, "End date/time is required"),
  timezone: z.string().min(1, "Timezone is required"),
  publish: z.boolean(),
});
