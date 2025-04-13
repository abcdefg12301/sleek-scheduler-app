
import { z } from 'zod';

// Form validation schema
export const eventFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  location: z.string().optional(),
  allDay: z.boolean(),
  start: z.date(),
  end: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  recurrenceEnabled: z.boolean(),
  recurrenceFrequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  recurrenceInterval: z.number().int().positive(),
  recurrenceEndDate: z.date().optional(),
  recurrenceCount: z.number().int().positive().optional(),
  color: z.string().optional(),
})
.refine(data => {
  if (data.allDay) return true;
  return new Date(data.end) >= new Date(data.start);
}, {
  message: "End date must be after start date",
  path: ["end"]
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
