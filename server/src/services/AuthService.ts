import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { userRepository } from '../repositories/UserRepository';
import { reminderRepository } from '../repositories/ReminderRepository';
import { signAuthToken, verifyAuthToken } from '../utils/jwt';

const GRACE_EMAIL = 'grace.user@email.com';
const SALT_ROUNDS = 10;
const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1586006552138-ea18985ab492?crop=entropy&cs=srgb&fm=jpg&q=85';
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export class AuthService {
  async register(name: string, email: string, password: string) {
    if (!email || !password) throw new Error('Email and password are required');
    if (password.length < 8) throw new Error('Password must be at least 8 characters');
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) throw new Error('An account with this email already exists');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.createUser({
      name: name?.trim() || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      passwordHash,
      avatarUrl: DEFAULT_AVATAR,
    });

    const grace = await userRepository.findByEmail(GRACE_EMAIL);
    if (grace) await reminderRepository.copyTemplateForUser(user.id, grace.id);

    const token = signAuthToken(user.id, user.email);
    return { token, user };
  }

  async login(email: string, password: string) {
    if (!email || !password) throw new Error('Email and password are required');
    const user = await userRepository.findByEmail(email.toLowerCase().trim());
    if (!user) throw new Error('Invalid email or password');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid email or password');
    const token = signAuthToken(user.id, user.email);
    return { token, user };
  }

  async socialLogin(provider: 'google' | 'apple') {
    const email = provider === 'google' ? 'google.user@vitality.demo' : 'apple.user@vitality.demo';
    let user = await userRepository.findByEmail(email);
    if (!user) {
      const passwordHash = await bcrypt.hash(`${provider}-social-${Date.now()}`, SALT_ROUNDS);
      user = await userRepository.createUser({
        name: provider === 'google' ? 'Google User' : 'Apple User',
        email,
        passwordHash,
        avatarUrl: DEFAULT_AVATAR,
      });
      const grace = await userRepository.findByEmail(GRACE_EMAIL);
      if (grace) await reminderRepository.copyTemplateForUser(user.id, grace.id);
    }
    const token = signAuthToken(user.id, user.email);
    return { token, user };
  }

  async demoLogin() {
    const user = await userRepository.findByEmail(GRACE_EMAIL);
    if (!user) throw new Error('Demo account not seeded. Please run the seed script.');
    const token = signAuthToken(user.id, user.email);
    return { token, user };
  }

  async me(token: string) {
    const payload = verifyAuthToken(token);
    const user = await userRepository.findById(payload.sub);
    if (!user) throw new Error('User not found');
    return user;
  }

  async forgotPassword(email: string) {
    const normalizedEmail = (email ?? '').toLowerCase().trim();
    const genericMessage = 'If an account with that email exists, reset instructions have been generated.';
    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user) return { message: genericMessage };

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await userRepository.setResetToken(user.id, token, expires);
    console.log(`[AUTH] Password reset token for ${normalizedEmail}: ${token} (expires ${expires.toISOString()})`);

    return { message: genericMessage, resetToken: token };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) throw new Error('Token and new password are required');
    if (newPassword.length < 8) throw new Error('Password must be at least 8 characters');

    const user = await userRepository.findByResetToken(token);
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires.getTime() < Date.now()) {
      throw new Error('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.resetPassword(user.id, passwordHash);
    return { message: 'Password has been reset successfully.' };
  }
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    if (!currentPassword || !newPassword) throw new Error('Current and new password are required');
    if (newPassword.length < 8) throw new Error('New password must be at least 8 characters');

    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new Error('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.resetPassword(user.id, passwordHash);
    return { message: 'Password updated successfully.' };
  }
}

export const authService = new AuthService();
