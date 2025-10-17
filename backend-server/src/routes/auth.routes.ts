import { Router } from 'express';
import { register, login, refreshToken, logout } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator.js';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Yeni kullanıcı oluştur
 * @access  Public
 */
router.post('/register', validate(registerSchema), register);

/**
 * @route   POST /api/auth/login
 * @desc    Kullanıcı girişi ve token al
 * @access  Public
 */
router.post('/login', validate(loginSchema), login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Erişim tokenini yenile
 * @access  Public
 */
router.post('/refresh', validate(refreshTokenSchema), refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Kullanıcı çıkışı (refresh token geçersizleştir)
 * @access  Public
 */
router.post('/logout', validate(refreshTokenSchema), logout);

export default router;

