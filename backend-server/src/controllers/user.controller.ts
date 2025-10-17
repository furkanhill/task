import { Response, NextFunction } from 'express';
import userService from '../services/user.service.js';
import { AuthRequest, ApiResponse, PaginatedResponse } from '../types/index.js';


//User Controller
export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await userService.getAllUsers(req.query);

    res.status(200).json({
      success: true,
      data: result.users,
      pagination: result.pagination
    } as PaginatedResponse<typeof result.users[0]>);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json({
      success: true,
      data: user
    } as ApiResponse);
  } catch (error: any) {
    if (error.message === 'kullanıcı bulunamadı') {
      res.status(404).json({
        success: false,
        message: error.message
      } as ApiResponse);
      return;
    }
    next(error);
  }
};

export const createUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: 'kullanıcı başarılı şekilde oluşturuldu',
      data: user.toJSON()
    } as ApiResponse);
  } catch (error: any) {
    if (error.message === 'bu e-postaya sahio kullanıcı var') {
      res.status(409).json({
        success: false,
        message: error.message
      } as ApiResponse);
      return;
    }
    if (error.message === 'Parent user bulunamadı') {
      res.status(404).json({
        success: false,
        message: error.message
      } as ApiResponse);
      return;
    }
    next(error);
  }
};

const handleUserUpdate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user?.role !== 'admin' && req.user?.id !== req.params.id) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Sadece kendi profilinizi güncelleyebilirsiniz'
      } as ApiResponse);
      return;
    }

    if (req.user?.role !== 'admin') {
      delete req.body.role;
      delete req.body.status;
    }

    const user = await userService.updateUser(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      data: user.toJSON()
    } as ApiResponse);
  } catch (error: any) {
    if (error.message === 'Kullanıcı bulunamadı') {
      res.status(404).json({
        success: false,
        message: error.message
      } as ApiResponse);
      return;
    }
    if (error.message === 'Bu email ile bir kullanıcı zaten mevcut') {
      res.status(409).json({
        success: false,
        message: error.message
      } as ApiResponse);
      return;
    }
    if (error.message === 'Parent kullanıcı bulunamadı' || error.message === 'Kullanıcı kendisiyle aynı parent olamaz') {
      res.status(400).json({
        success: false,
        message: error.message
      } as ApiResponse);
      return;
    }
    next(error);
  }
};

export const updateUser = handleUserUpdate;

export const patchUser = handleUserUpdate;

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await userService.deleteUser(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    } as ApiResponse);
  } catch (error: any) {
    if (error.message === 'Kullanıcı bulunamadı') {
      res.status(404).json({
        success: false,
        message: error.message
      } as ApiResponse);
      return;
    }
    if (error.message.includes('Kullanıcı silinemez çünkü')) {
      res.status(400).json({
        success: false,
        message: error.message
      } as ApiResponse);
      return;
    }
    next(error);
  }
};
