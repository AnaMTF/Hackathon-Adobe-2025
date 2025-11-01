import { z } from 'zod';

// Message action schemas
export const MessageCreateSchema = z.object({
  action: z.literal('create'),
  fields: z.object({
    senderUuid: z.string().uuid(),
    recipientUuid: z.string().uuid(),
    text: z.string().min(1).max(10000),
  }),
});

export const MessageMarkReadSchema = z.object({
  action: z.literal('markRead'),
});

export const MessageDeleteSchema = z.object({
  action: z.literal('delete'),
});

export const MessageActionSchema = z.discriminatedUnion('action', [
  MessageCreateSchema,
  MessageMarkReadSchema,
  MessageDeleteSchema,
]);

export type MessageAction = z.infer<typeof MessageActionSchema>;
