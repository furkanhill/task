import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service.js';
import { verifyRefreshToken } from '../utils/jwt.js';
import { ApiResponse } from '../types/index.js';

//Auth Controller
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'kullanıcı başarı şekilde kaydoldu',
      data: result
    } as ApiResponse);
  } catch (error: any) {
    if (error.message === 'bu e-postaya sahip kullanıcı var') {
      res.status(409).json({
        success: false,
        message: error.message
      } as ApiResponse);
      return;
    }
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: 'Login başarılı',
      data: result
    } as ApiResponse);
  } catch (error: any) {
    if (error.message === 'Geçersiz email veya şifre') {
      res.status(401).json({
        success: false,
        message: error.message
      } as ApiResponse);
      return;
    }
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    const decoded = verifyRefreshToken(token);

    const result = await authService.refreshToken(decoded.id, token);

    res.status(200).json({
      success: true,
      message: 'Token refreshed başarılı',
      data: result
    } as ApiResponse);
  } catch (error: any) {
    if (error.message === 'Geçersiz refresh token' || error.message === 'Kullanıcı bulunamadı') {
      res.status(401).json({
        success: false,
        message: 'Geçersiz refresh token'
      } as ApiResponse);
      return;
    }
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Refresh token gereklidir'
      } as ApiResponse);
      return;
    }

    const decoded = verifyRefreshToken(token);

    await authService.logout(decoded.id);

    res.status(200).json({
      success: true,
      message: 'Kullanıcı çıkışı başarıyla tamamlandı'
    } as ApiResponse);
  } catch (error) {
    res.status(200).json({
      success: true,
      message: 'Kullanıcı çıkışı başarıyla tamamlandı'
    } as ApiResponse);
  }
};
