import userRepository from '../repositories/user.repository.js';
import { IUser, PaginationQuery } from '../types/index.js';
import User from '../models/User.js';

/**
 * User Service
 */
export class UserService {

  async getAllUsers(query: PaginationQuery): Promise<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const { users, total } = await userRepository.findAll({
      page,
      limit,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
      search: query.search,
      role: query.role,
      status: query.status,
      parentId: query.parentId
    });

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  async getUserById(id: string): Promise<User> {
    const user = await userRepository.findById(id, true);
    
    if (!user) {
      throw new Error('kullanıcı bulunamadı');
    }

    return user;
  }

  async createUser(userData: Partial<IUser>): Promise<User> {
    const existingUser = await userRepository.findByEmail(userData.email!);
    if (existingUser) {
      throw new Error('bu e-postaya sahip kullanıcı var');
    }

    if (userData.parentId) {
      const parent = await userRepository.findById(userData.parentId);
      if (!parent) {
        throw new Error('Parent user bulunamadı');
      }
    }

    return await userRepository.create(userData);
  }

  async updateUser(id: string, userData: Partial<IUser>): Promise<User> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (userData.email && userData.email !== user.email) {
      const existingUser = await userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('bu e-postaya sahip kullanıcı var');
      }
    }

    // Verify parent exists if parentId is being changed
    if (userData.parentId !== undefined && userData.parentId !== user.parentId) {
      // Check for self-parenting
      if (userData.parentId === user.id) {
        throw new Error('Kullanıcı kendi parent olarak atayamaz');
      }

      if (userData.parentId) {
        const parent = await userRepository.findById(userData.parentId);
        if (!parent) {
          throw new Error('Parent user bulunamadı');
        }

        const isDescendant = await this.isUserDescendant(id, userData.parentId);
        if (isDescendant) {
          throw new Error('Bir alt kullanıcı üst kullanıcı olarak atanamaz');
        }
      }
    }

    const updatedUser = await userRepository.update(id, userData);
    if (!updatedUser) {
      throw new Error('kullanıcı güncellenemedi');
    }

    return updatedUser;
  }

  private async isUserDescendant(ancestorId: string, userId: string): Promise<boolean> {
    const user = await userRepository.findById(userId, true);
    if (!user) {
      return false;
    }
    if (user.children && user.children.length > 0) {
      for (const child of user.children) {
        if (child.id === ancestorId) {
          return true;
        }
        const foundInDescendants = await this.isUserDescendant(ancestorId, child.id);
        if (foundInDescendants) {
          return true;
        }
      }
    }

    return false;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('kullanıcı bulunamadı');
    }

    const childrenCount = await userRepository.countByParentId(id);
    if (childrenCount > 0) {
      throw new Error(
        `${childrenCount} alt kullanıcısı olan kullanıcı silinemiyor. Önce alt kullanıcıları silin.`
      );
    }

    const deleted = await userRepository.delete(id);
    if (!deleted) {
      throw new Error('kullanıcı silinemedi');
    }
  }
}

export default new UserService();

