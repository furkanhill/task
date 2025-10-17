import sequelize from '../config/sequelize.js';
import { QueryInterface } from 'sequelize';

/**
 * Veritabanı indeksleri 
 */
const addIndexes = async (): Promise<void> => {
  try {
    console.log('Veritabanı indeksleri oluşturuluyor...');
    
    const queryInterface: QueryInterface = sequelize.getQueryInterface();

    const existingIndexes = await queryInterface.showIndex('users') as any[];
    const indexNames = existingIndexes.map((idx: any) => idx.name);
    if (!indexNames.includes('users_email_idx')) {
      await queryInterface.addIndex('users', ['email'], {
        name: 'users_email_idx',
        unique: true
      });
      console.log('oluşturulan indexler => email');
    } else {
      console.log('email indexleri zaten var');
    }

    if (!indexNames.includes('users_parent_id_idx')) {
      await queryInterface.addIndex('users', ['parentId'], {
        name: 'users_parent_id_idx'
      });
      console.log('oluşturulan indexler => parentId');
    } else {
      console.log('parentId indexleri zaten var');
    }

    if (!indexNames.includes('users_status_idx')) {
      await queryInterface.addIndex('users', ['status'], {
        name: 'users_status_idx'
      });
      console.log('oluşturulan indexler => status');
    } else {
      console.log('status indexleri zaten var');
    }

    if (!indexNames.includes('users_role_idx')) {
      await queryInterface.addIndex('users', ['role'], {
        name: 'users_role_idx'
      });
      console.log('oluşturulan indexler => role');
    } else {
      console.log('role indexleri zaten var');
    }

    if (!indexNames.includes('users_created_at_idx')) {
      await queryInterface.addIndex('users', ['createdAt'], {
        name: 'users_created_at_idx'
      });
      console.log('oluşturulan indexler => createdAt');
    } else {
      console.log('createdAt indexleri zaten var');
    }

    if (!indexNames.includes('users_name_search_idx')) {
      await queryInterface.addIndex('users', ['firstName', 'lastName'], {
        name: 'users_name_search_idx'
      });
      console.log('oluşturulan indexler => firstName + lastName');
    } else {
      console.log('firstName + lastName indexleri zaten var');
    }
    if (!indexNames.includes('users_status_role_idx')) {
      await queryInterface.addIndex('users', ['status', 'role'], {
        name: 'users_status_role_idx'
      });
      console.log('oluşturulan indexler => status + role');
    } else {
      console.log('status + role indeksleri zaten var');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('hata:', error);
    process.exit(1);
  }
};

addIndexes();

