import sequelize from '../config/sequelize.js';
import User from '../models/User.js';

/**
 * Veritabanına örnek veri ekleme
 */
const seed = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');

    await sequelize.authenticate();
    console.log('Database connection established');

    const existingUsers = await User.count();
    if (existingUsers > 0) {
      console.log(`veritabanında zaten ${existingUsers} kullanıcı var. Seed işlemi atlanıyor.`);
      process.exit(0);
    }

    const rootUsers = await User.bulkCreate([
      {
        email: 'furkan@example.com',
        password: 'furkan09',
        firstName: 'Furkan',
        lastName: 'Tepe',
        role: 'admin',
        status: 'active',
        company: 'Micheal Scott Paper Company',
        department: 'Engineering',
        location: 'Aydın',
        phone: '+90 542 123 45 67',
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      {
        email: 'Aylin@example.com',
        password: 'Aylin123',
        firstName: 'Aylin',
        lastName: 'Kaya',
        role: 'user',
        status: 'active',
        company: 'Micheal Scott Paper Company',
        department: 'İnsan Kaynakları',
        location: 'Konya',
        phone: '+90 542 123 45 67',
        avatar: 'https://i.pravatar.cc/150?img=5'
      }
    ], { individualHooks: true });

    const [user1, user2] = rootUsers;

    const secondLevelUsers = await User.bulkCreate([
      {
        email: 'mehmet@example.com',
        password: 'mehmet123',
        firstName: 'Mehmet',
        lastName: 'Yapıcı',
        role: 'user',
        status: 'active',
        company: 'Micheal Scott Paper Company',
        department: 'Mühendislik',
        location: 'Konya',
        phone: '+90 542 123 45 67',
        avatar: 'https://i.pravatar.cc/150?img=3',
        parentId: user1.id
      },
      {
        email: 'gamze@example.com',
        password: 'gamze123',
        firstName: 'Gamze',
        lastName: 'Durmaz',
        role: 'user',
        status: 'active',
        company: 'Micheal Scott Paper Company',
        department: 'İnsan Kaynakları',
        location: 'Konya',
        phone: '+90 542 123 45 67',
        avatar: 'https://i.pravatar.cc/150?img=9',
        parentId: user1.id
      },
      {
        email: 'charlie.davis@example.com',
        password: 'password123',
        firstName: 'Charlie',
        lastName: 'Davis',
        role: 'user',
        status: 'active',
        company: 'TechCorp',
        department: 'Sales',
        location: 'New York, NY',
        phone: '+1-555-0105',
        avatar: 'https://i.pravatar.cc/150?img=7',
        parentId: user2.id
      }
    ], { individualHooks: true });

    const [user3, user4, user5] = secondLevelUsers;

    await User.bulkCreate([
      {
        email: 'david.lee@example.com',
        password: 'password123',
        firstName: 'David',
        lastName: 'Lee',
        role: 'user',
        status: 'active',
        company: 'TechCorp',
        department: 'Engineering',
        location: 'San Francisco, CA',
        phone: '+1-555-0106',
        avatar: 'https://i.pravatar.cc/150?img=11',
        parentId: user3.id
      },
      {
        email: 'emma.wilson@example.com',
        password: 'password123',
        firstName: 'Emma',
        lastName: 'Wilson',
        role: 'user',
        status: 'active',
        company: 'TechCorp',
        department: 'Sales',
        location: 'Chicago, IL',
        phone: '+1-555-0107',
        avatar: 'https://i.pravatar.cc/150?img=16',
        parentId: user5.id
      },
      {
        email: 'frank.taylor@example.com',
        password: 'password123',
        firstName: 'Frank',
        lastName: 'Taylor',
        role: 'user',
        status: 'inactive',
        company: 'TechCorp',
        department: 'Support',
        location: 'Los Angeles, CA',
        phone: '+1-555-0108',
        avatar: 'https://i.pravatar.cc/150?img=13',
        parentId: user4.id
      }
    ], { individualHooks: true });

    console.log('kullanıcılar başarıyla oluşturuldu');

    process.exit(0);
  } catch (error) {
    console.error('hata:', error);
    process.exit(1);
  }
};

seed();

