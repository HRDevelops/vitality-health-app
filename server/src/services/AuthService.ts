import { userRepository } from '../repositories/UserRepository';
import { signAuthToken, verifyAuthToken } from '../utils/jwt';

export class AuthService {
  private async getDemoUser() {
    const user = await userRepository.findFirst();
    if (!user) throw new Error('No user found. Please run the seed script.');
    return user;
  }

  async login(email: string, password: string) {
    if (!email || !password) throw new Error('Email and password are required');
    const user = await this.getDemoUser();
    const token = signAuthToken(user.id, email.toLowerCase());
    return { token, user };
  }

  async signup(email: string, password: string) {
    if (!email || !password) throw new Error('Email and password are required');
    const user = await this.getDemoUser();
    const token = signAuthToken(user.id, email.toLowerCase());
    return { token, user };
  }

  async demoLogin() {
    const user = await this.getDemoUser();
    const token = signAuthToken(user.id, user.email);
    return { token, user };
  }

  async me(token: string) {
    const payload = verifyAuthToken(token);
    const user = await userRepository.findById(payload.sub);
    if (!user) throw new Error('User not found');
    return user;
  }
}

export const authService = new AuthService();
