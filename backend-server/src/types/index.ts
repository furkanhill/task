import { Request } from 'express';

// User
export interface IUser {
  id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
  company?: string;
  department?: string;
  location?: string;
  phone?: string;
  avatar?: string;
  parentId?: string | null;
  refreshToken?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  children?: IUser[];
  parent?: IUser;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface JWTPayload {
  id: string;
  email: string;
  role?: string;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

// sayfalandırma query parametreleri
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  role?: string;
  status?: string;
  parentId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  company?: string;
  department?: string;
  location?: string;
  phone?: string;
  avatar?: string;
  parentId?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: Partial<IUser>;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

