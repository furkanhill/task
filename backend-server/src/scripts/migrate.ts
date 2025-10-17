import sequelize from '../config/sequelize.js';
import '../models/User.js';

const migrate = async (): Promise<void> => {
  try {
    console.log('Starting database migration...');
    console.log('Models registered:', sequelize.models);
    
    await sequelize.authenticate();
    console.log('Database connection established');

    console.log('tablolar oluşturuluyor...');
    await sequelize.sync({ force: true, logging: console.log });
    console.log('tablolar başarıyla oluşturuldu');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Migration başarıyla tamamlandı!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('hata:', error);
    process.exit(1);
  }
};

migrate();

