import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  role: z.enum(['admin', 'user'], { errorMap: () => ({ message: 'Role must be either admin or user' }) }).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  company: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')),
  parentId: z.string().uuid('Invalid parent ID format').optional().nullable()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

