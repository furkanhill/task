import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize.js';
import bcrypt from 'bcrypt';
import { IUser } from '../types/index.js';

// Kullanıcı oluşturma öznitelikleri
interface UserCreationAttributes extends Optional<IUser, 'id' | 'createdAt' | 'updatedAt'> {}

class User extends Model<IUser, UserCreationAttributes> implements IUser {
  declare id: string;
  declare email: string;
  declare password: string;
  declare firstName?: string;
  declare lastName?: string;
  declare role?: string;
  declare status?: string;
  declare company?: string;
  declare department?: string;
  declare location?: string;
  declare phone?: string;
  declare avatar?: string;
  declare parentId?: string | null;
  declare refreshToken?: string | null;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
  

  declare children?: User[];
  declare parent?: User;


  async comparePassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  toJSON(): Partial<IUser> {
    const values = { ...this.get() } as any;
    delete values.password;
    delete values.refreshToken;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'user'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'active'
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  }
);

// nested User ilişkisi
User.hasMany(User, {
  as: 'children',
  foreignKey: 'parentId',
  onDelete: 'SET NULL'
});

User.belongsTo(User, {
  as: 'parent',
  foreignKey: 'parentId'
});

export default User;

