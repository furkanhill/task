/**
 * User Form Validation Schemas
 */

import { z } from 'zod';

export const userFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  role: z.enum(['admin', 'user'], {
    errorMap: () => ({ message: 'Role must be either admin or user' })
  }).optional(),
  status: z.enum(['active', 'inactive'], {
    errorMap: () => ({ message: 'Status must be either active or inactive' })
  }).optional(),
  company: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  parentId: z.string().uuid().nullable().optional(),
});

export const createUserSchema = userFormSchema.extend({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const updateUserSchema = userFormSchema.extend({
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .optional()
    .or(z.literal('')), // Allow empty string (means keep current password)
}).partial();

export type UserFormData = z.infer<typeof userFormSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;

