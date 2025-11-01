import { z } from 'zod';

// Event schema for posts
const EventSchema = z.object({
  location: z.string().min(1),
  time: z.string().datetime().or(z.date()),
});

// Post action schemas
export const PostCreateSchema = z.object({
  action: z.literal('create'),
  content: z.object({
    authorUuid: z.string().uuid(),
    text: z.string().min(1).max(256),
    poze: z.array(z.string().url()).max(3).default([]),
    tags: z.array(z.string().uuid()).max(10).default([]),
    event: EventSchema.optional(),
  }),
});

export const PostUpdateSchema = z.object({
  action: z.literal('update'),
  content: z.object({
    text: z.string().min(1).max(256).optional(),
    poze: z.array(z.string().url()).max(3).optional(),
    tags: z.array(z.string().uuid()).max(10).optional(),
    event: EventSchema.optional(),
  }).refine(
    (content) => Object.keys(content).length > 0,
    { message: "At least one field must be provided for update" }
  ),
});

export const PostLikeSchema = z.object({
  action: z.literal('like'),
  content: z.object({
    userUuid: z.string().uuid(),
  }),
});

export const PostUnlikeSchema = z.object({
  action: z.literal('unlike'),
  content: z.object({
    userUuid: z.string().uuid(),
  }),
});

export const PostCommentSchema = z.object({
  action: z.literal('comment'),
  content: z.object({
    userUuid: z.string().uuid(),
    text: z.string().min(1).max(500),
  }),
});

export const PostFavoriteSchema = z.object({
  action: z.literal('favorite'),
  content: z.object({
    userUuid: z.string().uuid(),
  }),
});

export const PostUnfavoriteSchema = z.object({
  action: z.literal('unfavorite'),
  content: z.object({
    userUuid: z.string().uuid(),
  }),
});

export const PostDeleteSchema = z.object({
  action: z.literal('delete'),
});

export const PostActionSchema = z.discriminatedUnion('action', [
  PostCreateSchema,
  PostUpdateSchema,
  PostLikeSchema,
  PostUnlikeSchema,
  PostCommentSchema,
  PostFavoriteSchema,
  PostUnfavoriteSchema,
  PostDeleteSchema,
]);

export type PostAction = z.infer<typeof PostActionSchema>;