import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Types } from 'mongoose';
import { User, IUser } from '../models/User';
import { signAuthToken } from '../utils/jwt';
import { achievementService } from './AchievementService';

const SALT_ROUNDS = 10;
const GUEST_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=srgb&fm=jpg&q=85';

export interface OnboardingAnswers {
  campusName?: string;
  targetDailyDistanceKm?: number;
  hasHypertensionHistory?: boolean;
  notifyCrisisAlerts?: boolean;
  preferredActivityMode?: 'WALKATHON' | 'CYCLING';
}

export class OnboardingService {
  /**
   * Saves onboarding questionnaire answers and marks onboardingCompleted: true.
   */
  async submitQuestionnaire(userId: string | Types.ObjectId, answers: OnboardingAnswers): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.onboardingCompleted = true;
    user.onboardingData = {
      ...user.onboardingData,
      ...answers,
      submittedAt: new Date(),
    };

    await user.save();

    // Award Onboarding achievement
    await achievementService.checkAndUnlock(userId, {
      type: 'ONBOARDING_COMPLETED',
    });

    return user;
  }

  /**
   * Creates an anonymous UNREGISTERED_GUEST account.
   */
  async createGuestSession(): Promise<{ token: string; user: IUser }> {
    const randomHex = crypto.randomBytes(6).toString('hex');
    const tempEmail = `guest_${randomHex}@vitality.local`;
    const dummyPasswordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), SALT_ROUNDS);

    const guestUser = await User.create({
      name: 'Guest Explorer',
      email: tempEmail,
      passwordHash: dummyPasswordHash,
      avatarUrl: GUEST_AVATAR,
      accountStatus: 'UNREGISTERED_GUEST',
      onboardingCompleted: false,
      isDemo: false,
    });

    const token = signAuthToken(guestUser.id, guestUser.email);
    return { token, user: guestUser };
  }

  /**
   * Claims a guest account with permanent credentials without losing any existing logs.
   */
  async claimGuestAccount(
    guestUserId: string | Types.ObjectId,
    credentials: { name: string; email: string; password: string }
  ): Promise<{ user: IUser; token: string }> {
    const { name, email, password } = credentials;
    if (!email || !password) throw new Error('Email and password are required');
    if (password.length < 8) throw new Error('Password must be at least 8 characters');

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing && existing._id.toString() !== guestUserId.toString()) {
      throw new Error('An account with this email already exists.');
    }

    const guestUser = await User.findById(guestUserId);
    if (!guestUser) throw new Error('Guest account not found');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    guestUser.name = name?.trim() || 'Active Member';
    guestUser.email = normalizedEmail;
    guestUser.passwordHash = passwordHash;
    guestUser.accountStatus = 'ACTIVE_USER';

    await guestUser.save();

    // Award delayed registration achievement
    await achievementService.checkAndUnlock(guestUserId, {
      type: 'CLAIM_GUEST',
    });

    const token = signAuthToken(guestUser.id, guestUser.email);
    return { user: guestUser, token };
  }

  /**
   * Toggles sandbox demo mode for the user.
   */
  async setDemoMode(userId: string | Types.ObjectId, enableDemo: boolean): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.isDemo = Boolean(enableDemo);
    await user.save();

    if (enableDemo) {
      await achievementService.checkAndUnlock(userId, {
        type: 'DEMO_MODE_TOGGLED',
      });
    }

    return user;
  }

  /**
   * Submits non-intrusive 5-star app feedback and rating.
   */
  async submitRating(
    userId: string | Types.ObjectId,
    rating: number,
    feedback?: string
  ): Promise<{ success: boolean; hasRatedApp: boolean }> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.hasRatedApp = true;
    user.onboardingData = {
      ...user.onboardingData,
      rating: Math.min(5, Math.max(1, rating)),
      feedback: feedback?.trim() || null,
      ratedAt: new Date(),
    };
    await user.save();

    // Award Rating achievement
    await achievementService.checkAndUnlock(userId, {
      type: 'APP_RATED',
    });

    return { success: true, hasRatedApp: true };
  }
}

export const onboardingService = new OnboardingService();
