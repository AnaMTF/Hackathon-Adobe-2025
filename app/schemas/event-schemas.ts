import { z } from 'zod';

// Event action schemas
export const EventCreateSchema = z.object({
  action: z.literal('create'),
  fields: z.object({
    name: z.string().min(1, 'Event name is required').max(255, 'Event name must not exceed 255 characters'),
    details: z.string().optional().or(z.literal('')),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    creatorUuid: z.string().uuid('Invalid creator UUID'),
  }),
});

export const EventUpdateSchema = z.object({
  action: z.literal('update'),
  fields: z.object({
    name: z.string().min(1).max(255).optional(),
    details: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }).refine(
    (fields) => Object.keys(fields).length > 0,
    { message: "At least one field must be provided for update" }
  ),
});

export const EventDeleteSchema = z.object({
  action: z.literal('delete'),
});

export const EventActionSchema = z.discriminatedUnion('action', [
  EventCreateSchema,
  EventUpdateSchema,
  EventDeleteSchema,
]);

export type EventAction = z.infer<typeof EventActionSchema>;
