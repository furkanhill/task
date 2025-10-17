import { Op } from 'sequelize';
import User from '../models/User.js';
import { IUser } from '../types/index.js';

/**
 * User Repository
 */
export class UserRepository {
  async findById(id: string, includeChildren: boolean = false): Promise<User | null> {
    const include: any[] = [];
    
    if (includeChildren) {
      include.push(
        {
          model: User,
          as: 'children',
          attributes: { exclude: ['password', 'refreshToken'] },
          required: false,
          include: [
            {
              model: User,
              as: 'children',
              attributes: { exclude: ['password', 'refreshToken'] },
              required: false
            }
          ]
        },
        {
          model: User,
          as: 'parent',
          attributes: { exclude: ['password', 'refreshToken'] },
          required: false
        }
      );
    }

    return await User.findByPk(id, {
      attributes: { exclude: ['password', 'refreshToken'] },
      include
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
    role?: string;
    status?: string;
    parentId?: string;
    includeRelations?: boolean;
  }): Promise<{ users: User[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      role,
      status,
      parentId,
      includeRelations = true
    } = options;

    const offset = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { company: { [Op.iLike]: `%${search}%` } },
        { department: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (parentId !== undefined) {
      where.parentId = parentId === 'null' || parentId === '' ? null : parentId;
    }

    const include: any[] = includeRelations ? [
      {
        model: User,
        as: 'children',
        attributes: { exclude: ['password', 'refreshToken'] },
        required: false
      },
      {
        model: User,
        as: 'parent',
        attributes: { exclude: ['password', 'refreshToken'] },
        required: false
      }
    ] : [];

    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
      attributes: { exclude: ['password', 'refreshToken'] },
      include
    });

    return { users, total: count };
  }

  async create(userData: Partial<IUser>): Promise<User> {
    return await User.create(userData as any);
  }

  async update(id: string, userData: Partial<IUser>): Promise<User | null> {
    const user = await User.findByPk(id);
    if (!user) return null;

    await user.update(userData);
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const user = await User.findByPk(id);
    if (!user) return false;

    await user.destroy();
    return true;
  }

  async countByParentId(parentId: string): Promise<number> {
    return await User.count({ where: { parentId } });
  }


  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await User.update({ refreshToken }, { where: { id } });
  }

  async count(): Promise<number> {
    return await User.count();
  }
}

export default new UserRepository();

