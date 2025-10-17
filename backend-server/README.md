# Kullanıcı Yönetim Sistemi Backend API

Node.js ve Express.js ile geliştirilmiş, kullanıcı yönetimi ve hiyerarşik organizasyon için REST API servisi.

## Kullanılan Teknolojiler

- **Node.js** + **Express.js**
- **TypeScript** - Tam tip güvenliği
- **Sequelize ORM** - PostgreSQL ile
- **JWT Kimlik Doğrulama** - Access + refresh token'lar
- **bcrypt** - Parola hashleme
- **Zod** - İstek doğrulama
- **PostgreSQL** - Veritabanı

## Kurulum

### 1. Bağımlılıkları yükleyin:
```bash
npm install
```

### 2. PostgreSQL veritabanı kurun:
```bash
# PostgreSQL'de veritabanı oluşturun
createdb taskdb
```

### 3. Environment dosyasını yapılandırın:
```bash
# .env.example dosyasını .env olarak kopyalayın
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskdb
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000
```

### 4. Veritabanı migration'larını çalıştırın:
```bash
npm run db:migrate
```

### 5. Örnek verileri yükleyin (isteğe bağlı):
```bash
npm run db:seed
```

### 6. Performans için indexleri ekleyin (önerilen):
```bash
npm run db:indexes
```

### 7. Sunucuyu başlatın:
```bash
# Geliştirme modu
npm run dev


Sunucu `http://localhost:3001` adresinde çalışacak.

## Varsayılan Hesaplar

**Admin Hesabı:**
- Email: `furkan@example.com`
- Şifre: `furkan09`
- Rol: `admin`

**Kullanıcı Hesabı:**
- Email: `Aylin@example.com`
- Şifre: `Aylin123`
- Rol: `user`

## API Endpoint'leri

### Base URL
```
http://localhost:3001/api
```

### Kimlik Doğrulama
| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| POST | `/auth/register` | Yeni kullanıcı kaydı | Herkese açık |
| POST | `/auth/login` | Kullanıcı girişi | Herkese açık |
| POST | `/auth/refresh` | Token yenileme | Herkese açık |
| POST | `/auth/logout` | Çıkış yapma | Herkese açık |

### Kullanıcı Yönetimi
| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| GET | `/users` | Kullanıcıları listele (pagination, filtreleme) | Tüm kullanıcılar |
| GET | `/users/:id` | Tek kullanıcı detayı (alt kullanıcılarla) | Tüm kullanıcılar |
| POST | `/users` | Yeni kullanıcı oluştur | Sadece Admin |
| PUT | `/users/:id` | Kullanıcıyı güncelle (tam güncelleme) | Sadece Admin |
| PATCH | `/users/:id` | Kullanıcıyı güncelle (kısmi güncelleme) | Sadece Admin |
| DELETE | `/users/:id` | Kullanıcıyı sil | Sadece Admin |

## Rol İzinleri

| İşlem | User | Admin |
|-------|------|-------|
| Kullanıcıları görüntüleme | ✅ | ✅ |
| Kullanıcı oluşturma | ❌ | ✅ |
| Kullanıcı düzenleme | ❌ | ✅ |
| Kullanıcı silme | ❌ | ✅ |

## Özellikler

### 🔐 Güvenlik
- JWT tabanlı kimlik doğrulama
- bcrypt ile parola hashleme
- Rol bazlı yetkilendirme
- Input validation (Zod)
- SQL injection koruması

### 📊 Veri Yönetimi
- Hiyerarşik kullanıcı yapısı (parent-child ilişkiler)
- Sayfalama (pagination)
- Sıralama ve filtreleme
- Tam metin arama
- Bulk insert işlemleri

### 🏗️ Mimari
- TypeScript ile tip güvenliği
- Modüler yapı
- Error handling middleware

## Kullanım Örnekleri

### Giriş Yapma
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"furkan@example.com","password":"furkan09"}'
```

### Kullanıcıları Listeleme
```bash
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Yeni Kullanıcı Oluşturma (Admin)
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@example.com",
    "password":"password123",
    "firstName":"Ahmet",
    "lastName":"Yılmaz",
    "role":"user",
    "company":"Teknoloji A.Ş.",
    "department":"Mühendislik"
  }'
```

### Query Parametreleri (GET /users)
- `page`: Sayfa numarası (varsayılan: 1)
- `limit`: Sayfa başına öğe sayısı (varsayılan: 10, max: 100)
- `sortBy`: Sıralama alanı (varsayılan: createdAt)
- `sortOrder`: Sıralama yönü (ASC/DESC, varsayılan: DESC)
- `search`: Arama terimi (ad, soyad, email, şirket, departman, konum)
- `role`: Rol filtresi (admin/user)
- `status`: Durum filtresi (active/inactive)
- `parentId`: Üst kullanıcı filtresi (uuid veya 'null')

## Veritabanı Şeması

### Users Tablosu
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUID | Birincil anahtar |
| email | VARCHAR | E-posta (benzersiz) |
| password | VARCHAR | Hashlenmiş şifre |
| firstName | VARCHAR | Ad |
| lastName | VARCHAR | Soyad |
| role | VARCHAR | Rol (admin/user) |
| status | VARCHAR | Durum (active/inactive) |
| company | VARCHAR | Şirket |
| department | VARCHAR | Departman |
| location | VARCHAR | Konum |
| phone | VARCHAR | Telefon |
| avatar | TEXT | Avatar URL |
| parentId | UUID | Üst kullanıcı referansı |
| refreshToken | TEXT | JWT refresh token |
| createdAt | TIMESTAMP | Oluşturulma tarihi |
| updatedAt | TIMESTAMP | Güncellenme tarihi |

### İlişkiler
- **Self-referencing**: Kullanıcılar bir üst kullanıcıya sahip olabilir
- **One-to-Many**: Bir kullanıcı birden fazla alt kullanıcıya sahip olabilir
- **Cascading**: Üst kullanıcı silindiğinde, alt kullanıcıların parentId'si NULL olur

## Performans Optimizasyonları

- ✅ **Bulk Insert**: Seeding işlemi
- ✅ **Database Indexes**: Sorgular
- ✅ **Selective Loading**: Gereksiz veri transferi
- ✅ **Connection Pooling**: Sequelize ile yapılandırılmış

## Test

### Postman Collection
`postman_collection.json` dosyasını Postman'e import ederek tüm endpoint'leri test edebilirsiniz.

### Health Check
```bash
curl http://localhost:3001/health
```

## Komutlar

```bash
npm run dev          # Geliştirme sunucusu (hot reload)
npm run build        # Production build
npm run start        # Production sunucusu
npm run db:migrate   # Veritabanı migration'ları
npm run db:seed      # Örnek verileri yükle
npm run db:indexes   # Performans indexleri ekle
```

## Hata Kodları

- `200` - Başarılı
- `201` - Oluşturuldu
- `400` - Geçersiz istek (validation hatası)
- `401` - Yetkisiz (geçersiz/süresi dolmuş token)
- `403` - Yasak (yetersiz yetki)
- `404` - Bulunamadı
- `409` - Çakışma (duplicate entry)
- `500` - Sunucu hatası

## Güvenlik

- Parolalar bcrypt ile hashlenir (10 rounds)
- JWT token'lar süre sınırlı
- Refresh token rotasyonu
- Tüm girişler Zod ile doğrulanır
- Sequelize ORM ile SQL injection koruması
- CORS yapılandırması
- Hassas veriler response'larda gizlenir