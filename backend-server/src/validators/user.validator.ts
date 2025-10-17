import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['admin', 'user'], { errorMap: () => ({ message: 'Role must be either admin or user' }) }).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  company: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')),
  parentId: z.string().uuid('Invalid parent ID format').optional().nullable()
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['admin', 'user'], { errorMap: () => ({ message: 'Role must be either admin or user' }) }).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  company: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')),
  parentId: z.string().uuid('Invalid parent ID format').optional().nullable()
});

export const patchUserSchema = updateUserSchema.partial();

export const getUsersQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional(),
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  parentId: z.string().uuid('Invalid parent ID format').optional()
});

export const userIdSchema = z.object({
  id: z.string().uuid('Invalid user ID format')
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type PatchUserInput = z.infer<typeof patchUserSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
export type UserIdParam = z.infer<typeof userIdSchema>;

