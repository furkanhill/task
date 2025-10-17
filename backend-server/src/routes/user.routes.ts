import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  patchUser,
  deleteUser
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, validateQuery, validateParams } from '../middleware/validate.js';
import {
  createUserSchema,
  updateUserSchema,
  patchUserSchema,
  getUsersQuerySchema,
  userIdSchema
} from '../validators/user.validator.js';

const router = Router();

// tüm kullanıcı rotaları kimlik doğrulama gerektirir
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Tüm kullanıcıları getir (pagination, sıralama, filtreleme)
 * @access  Protected (All authenticated users)
 */
router.get('/', validateQuery(getUsersQuerySchema), getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Tek bir kullanıcıyı ID'ye göre getir (nested children)
 * @access  Protected (All authenticated users)
 */
router.get('/:id', validateParams(userIdSchema), getUserById);

/**
 * @route   POST /api/users
 * @desc    Yeni kullanıcı oluştur
 * @access  Protected (Admin only)
 */
router.post('/', authorize('admin'), validate(createUserSchema), createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Kullanıcıyı güncelle (tam güncelleme)
 * @access  Protected (Admin only)
 */
router.put('/:id', authorize('admin'), validateParams(userIdSchema), validate(updateUserSchema), updateUser);

/**
 * @route   PATCH /api/users/:id
 * @desc    Kullanıcıyı güncelle (kısmi güncelleme)
 * @access  Protected (Admin only)
 */
router.patch('/:id', authorize('admin'), validateParams(userIdSchema), validate(patchUserSchema), patchUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Kullanıcıyı sil
 * @access  Protected (Admin only)
 */
router.delete('/:id', authorize('admin'), validateParams(userIdSchema), deleteUser);

export default router;

