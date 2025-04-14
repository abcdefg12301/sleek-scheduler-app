
import { z } from 'zod';

export const eventFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  allDay: z.boolean().default(false),
  start: z.date(),
  end: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  color: z.string().optional(),
  recurrenceEnabled: z.boolean().default(false),
  recurrenceFrequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('daily'),
  recurrenceInterval: z.number().int().positive().default(1),
  recurrenceEndDate: z.date().optional().nullable(),
  recurrenceCount: z.number().int().positive().default(1),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
