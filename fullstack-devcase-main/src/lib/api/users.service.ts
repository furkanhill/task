/**
 * Users Service
 */

import apiClient from './client';
import { User } from './auth.service';
import { toURLSearchParams } from '../utils';

export interface UsersQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  role?: string;
  status?: string;
  parentId?: string;
}

export interface UserWithChildren extends User {
  children?: UserWithChildren[];
  parent?: User;
  parentId?: string | null;
}

export interface PaginatedUsersResponse {
  success: boolean;
  data: UserWithChildren[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserResponse {
  success: boolean;
  data: UserWithChildren;
  message?: string;
}

class UsersService {
  /**
   * Get all users with pagination, sorting, and filtering
   */
  async getUsers(query: UsersQuery = {}): Promise<PaginatedUsersResponse> {
    const params = toURLSearchParams(query);
    const response = await apiClient.get<PaginatedUsersResponse>(`/users?${params.toString()}`);
    return response.data;
  }

  /**
   * Get single user by ID
   */
  async getUserById(id: string): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>(`/users/${id}`);
    return response.data;
  }

  /**
   * Create new user
   */
  async createUser(data: Partial<UserWithChildren>): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>('/users', data);
    return response.data;
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: Partial<UserWithChildren>): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(`/users/${id}`, data);
    return response.data;
  }

  /**
   * Partial update user
   */
  async patchUser(id: string, data: Partial<UserWithChildren>): Promise<UserResponse> {
    const response = await apiClient.patch<UserResponse>(`/users/${id}`, data);
    return response.data;
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  }
}

export default new UsersService();

