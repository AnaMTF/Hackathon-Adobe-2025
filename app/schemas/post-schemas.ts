import { z } from 'zod';

// Post action schemas
export const PostCreateSchema = z.object({
  action: z.literal('create'),
  content: z.object({
    authorUuid: z.string().uuid(),
    title: z.string().min(1).max(120),
    body: z.string().min(1),
    image: z.string().startsWith('data:image').optional(),
    code: z.string().optional(),
  }),
});

export const PostUpdateSchema = z.object({
  action: z.literal('update'),
  content: z.object({
    title: z.string().min(1).max(120).optional(),
    body: z.string().min(1).optional(),
    image: z.string().startsWith('data:image').nullable().optional(),
    code: z.string().nullable().optional(),
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