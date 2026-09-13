import mongoose from 'mongoose';
import { User } from './models/User';
import { achievementService } from './services/AchievementService';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vitality';

export async function seedAchievements() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB for Achievement Seeding.');

  const grace = await User.findOne({ email: 'grace.user@email.com' });
  if (!grace) {
    console.log('Grace user not found. Skipping.');
    return;
  }

  // Seed baseline achievements for Grace
  const starterKeys = [
    'FIRST_BP_LOG',
    'OPTIMAL_BP_READING',
    'FIRST_GLUCOSE_LOG',
    'FIRST_MOVE_WALK',
    'WALK_1KM',
    'WALK_5KM',
    'FIRST_MEAL_SCAN',
    'OPTIMAL_DASH_MEAL',
    'JOIN_CAMPUS_TEAM',
    'LINK_CARE_CIRCLE',
    'COMPLETE_ONBOARDING',
    'WATER_LOG_FIRST',
    'CO2_FIRST_OFFSET',
  ];

  for (const key of starterKeys) {
    await achievementService.unlock(grace._id, key);
  }

  const result = await achievementService.getUserAchievements(grace._id);
  console.log(`Grace achievements: ${result.totalUnlocked}/${result.totalAvailable} unlocked.`);
}

if (require.main === module) {
  seedAchievements()
    .then(() => {
      console.log('Achievement seed finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Achievement seed failed:', err);
      process.exit(1);
    });
}
