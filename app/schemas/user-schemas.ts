import { z } from 'zod';

// User action schemas
export const UserUpdateSchema = z.object({
  action: z.literal('update'),
  fields: z.object({
    numeFullName: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
    parola: z.string().min(6).max(255).optional(),
    poza: z.string().url().optional(),
    telefon: z.string().regex(/^[+]?[\d\s-().]+$/).optional(),
    departament: z.string().min(1).max(100).optional(),
    jobTitle: z.string().min(1).max(100).optional(),
    location: z.string().min(1).max(255).optional(),
  }).refine(
    (fields) => Object.keys(fields).length > 0,
    { message: "At least one field must be provided for update" }
  ),
});

export const UserCreateSchema = z.object({
  action: z.literal('create'),
  fields: z.object({
    numeFullName: z.string().min(1).max(100),
    email: z.string().email(),
    parola: z.string().min(6).max(255),
    poza: z.string().url().optional(),
    telefon: z.string().regex(/^[+]?[\d\s-().]+$/).optional(),
    departament: z.string().min(1).max(100),
    jobTitle: z.string().min(1).max(100),
    location: z.string().min(1).max(255),
  }),
});

export const UserDeleteSchema = z.object({
  action: z.literal('delete'),
});

export const UserActionSchema = z.discriminatedUnion('action', [
  UserCreateSchema,
  UserUpdateSchema,
  UserDeleteSchema,
]);

export type UserAction = z.infer<typeof UserActionSchema>;