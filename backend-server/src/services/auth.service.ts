import userRepository from '../repositories/user.repository.js';
import { generateTokens } from '../utils/jwt.js';
import { RegisterData, LoginCredentials, TokenResponse } from '../types/index.js';


//Authentication Service
export class AuthService {

  async register(data: RegisterData): Promise<TokenResponse> {

    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('e-postaya sahip kullanıcı var');
    }

    const user = await userRepository.create(data);
    const tokens = generateTokens(user);

    await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: user.toJSON()
    };
  }

  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const { email, password } = credentials;

 
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('geçersiz e-posta veya şifre');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('geçersiz e-posta veya şifre');
    }

    const tokens = generateTokens(user);

    await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: user.toJSON()
    };
  }

  async refreshToken(userId: string, refreshToken: string): Promise<TokenResponse> {

    const user = await userRepository.findByEmail('');
    const userById = await userRepository.findById(userId);
    
    if (!userById) {
      throw new Error('kullanıcı bulunamadı');
    }

    const fullUser = await userRepository.findByEmail(userById.email);
    if (!fullUser || fullUser.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    const tokens = generateTokens(fullUser);

    await userRepository.updateRefreshToken(fullUser.id, tokens.refreshToken);

    return {
      ...tokens,
      user: fullUser.toJSON()
    };
  }

  async logout(userId: string): Promise<void> {
    await userRepository.updateRefreshToken(userId, null);
  }
}

export default new AuthService();

