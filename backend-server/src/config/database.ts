import sequelize from './sequelize.js';


export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('veritabanı bağlantısı başarılı.');
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('modeller senkronize edildi.');
    }
  } catch (error) {
    console.error('veritabanına bağlanılamıyor:', error);
    process.exit(1);
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('veritabanı bağlantısı kapatıldı.');
  } catch (error) {
    console.error('veritabanı bağlantısı kapatılırken hata oldu:', error);
  }
};
