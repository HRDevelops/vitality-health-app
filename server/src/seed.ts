import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });
dotenv.config();

import { connectDB } from './config/db';
import { User } from './models/User';
import { ActivityLog } from './models/ActivityLog';
import { NutritionLog } from './models/NutritionLog';
import { Podcast } from './models/Podcast';
import { CommunityMember } from './models/CommunityMember';
import { Reminder } from './models/Reminder';
import { lastNDates, addDaysString, todayString } from './utils/date';
import mongoose from 'mongoose';

const GRACE_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

async function seed() {
  await connectDB();

  console.log('[seed] clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    ActivityLog.deleteMany({}),
    NutritionLog.deleteMany({}),
    Podcast.deleteMany({}),
    CommunityMember.deleteMany({}),
    Reminder.deleteMany({}),
  ]);

  console.log('[seed] creating Grace...');
  const grace = await User.create({
    name: 'Grace',
    email: 'grace@vitality.app',
    avatarUrl: GRACE_AVATAR,
    healthScore: 84,
    healthScoreNote: 'Based on your overall health test, your score is 84 and considered good.',
    currentWeightKg: 58,
    targetWeightKg: 55,
    heightCm: 165,
    age: 24,
    isPremium: false,
    podcastSessionsCompleted: 2,
    podcastStreakCount: 2,
    lastListenDate: addDaysString(todayString(), -1),
  });

  console.log('[seed] creating 7 days of activity logs...');
  const dates = lastNDates(7, new Date().toISOString().slice(0, 10));
  const stepsPattern = [8200, 10500, 7300, 11200, 6400, 9200, 9890];
  const activityDocs = dates.map((logDate, i) => ({
    userId: grace._id,
    logDate,
    steps: stepsPattern[i],
    goalSteps: 10000,
    caloriesBurned: Math.round(stepsPattern[i] * 0.045),
    distanceKm: Math.round((stepsPattern[i] / 1300) * 10) / 10,
    activeMinutes: Math.round(stepsPattern[i] / 200),
    waterMl: i === dates.length - 1 ? 750 : 1200 + i * 50,
    waterGoalMl: 2000,
  }));
  await ActivityLog.insertMany(activityDocs);

  console.log('[seed] creating today\'s meal logs...');
  const today = dates[dates.length - 1];
  await NutritionLog.insertMany([
    {
      userId: grace._id,
      logDate: today,
      mealType: 'BREAKFAST',
      foodName: 'Salad with wheat and white egg',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDUHGylykv4ShsohCx057bG3K-19gbZSkSxSWX54N_4Rc1nC_7ngfCMsJdWz8k0yRj0HdV8SeXFGBd4LAaMvDtBvh5m8A2ZEevPzRYXQMyM321gBpjw6hmTuAuMJqMaBnn04c3Z-dYVELvDe2Qo76k0XaswBkr-0O3n1GkU4h440nDqddXmG3HyIuo6xuhAjbepqBmyPLghnz2M8_-_Dj9lCuAUFJi9AMoODiMBMW1YtQ0tGG4pDsX6ZA',
      calories: 200,
      carbsGrams: 20,
      proteinGrams: 12,
      fatGrams: 8,
      fiberGrams: 4,
      sugarGrams: 3,
      warningNote: null,
    },
    {
      userId: grace._id,
      logDate: today,
      mealType: 'BREAKFAST',
      foodName: 'Pumpkin soup',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCKgOaxcfPm3BMt6nDPl-fOTCVm4L84iznhTTTJ6k8m_ruvbGU_GUQc9YfOy98gu7p1dkx17Z1n7ikeaYen4c64fxSmFru4--qKpWEWm3BO6Dpm-AqGIg_OHFzybvw_b8slpco0CWRxgZ5s-mOY7Ne1hAxMGvxaGUjuB6X5OT4XGpvZ_I-KltOYI_4HztzfG3y9AObXZXvQqgwqfwSIKDMSdwCth_I3wU__ukyfcIJfiZPpJb9gqhAYnQ',
      calories: 200,
      carbsGrams: 44,
      proteinGrams: 4,
      fatGrams: 2,
      fiberGrams: 4,
      sugarGrams: 40,
      warningNote: 'Very High Carb!',
    },
    {
      userId: grace._id,
      logDate: today,
      mealType: 'LUNCH',
      foodName: 'Quinoa Power Bowl',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBOd5mosQylsImgZ4Kkluhhj5Na8CvAO76RPgDQuKtbuo42VnsvDAaOB0pKiFk7gOUr2r62szZ1XxHjeqfn4-FoXHUIzfExQBGBZtWXVPz-PcTAZAaaFgxlKjiPRJpsfZ4ixdjbPwMoldtU4f-TUCzHAy-D8WqI2BG72hV0Jb0FVTb6DfYjB2cZRlMYtWfpQNI7lCr28kCi7MPm7NEBxx5GkG4oZAbSeX7bstHnixhngqlBvbWblh0jpA',
      calories: 515,
      carbsGrams: 65,
      proteinGrams: 18,
      fatGrams: 20,
      fiberGrams: 9,
      sugarGrams: 6,
      warningNote: null,
    },
  ]);

  console.log('[seed] creating podcast tracks...');
  await Podcast.insertMany([
    {
      title: 'Sleep With Me Bedtime Stories',
      author: 'Vitality Wellness',
      durationMinutes: 25,
      audioUrl: 'https://cdn.pixabay.com/audio/2022/03/10/audio_2c99e1c3bf.mp3',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCaNWwX9oH-jxMGCXk38I6fdRr8cKPAFDryv50CjekoRR6XZ_YgnAdGyoHOiCvnRUamT0xGNujjo-ppcQWJuwZRFbgOJRykbY8-KDfPMotKo0uDiGEB8LaIu1wXB668zfhpu16yTUUfPn6fQjsomXSfHrcAX3q82o0so3qhXUHn1QFDmFakFfUzSGq7Rpal_-IHr99EbzLrezzaYDmV3iokaFwnl999G6_reAkMRDba7QY4YeX5U8Nh3Q',
      isPremium: false,
      isDailyPick: true,
      category: 'Sleep',
    },
    {
      title: 'Living Beyond Fear',
      author: 'Vitality Wellness',
      durationMinutes: 15,
      audioUrl: 'https://cdn.pixabay.com/audio/2022/03/10/audio_2c99e1c3bf.mp3',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB2d0DcEAyHmipykhN5PqsHfOb1piSk4-c9idSV3LXFIXIB1UHfvCEmUFrdCDkQElMbxOHqwZuc5MktmyWveujTLTBsIXGBUAG8R05DBFh8JfWVHKAJfMCvu51FMqqvCB6MbzEr3qH06evpkPGJLo0qPtz3eXfyTBQ8P1CbWHYmHF5NisnTLXb8W84datTH3wbkIbwSWx530VOWWWW8NqpYGFv220QStW1Cs73USYZps08ApR9oTZ-4jw',
      isPremium: false,
      isDailyPick: false,
      category: 'Mindset',
    },
    {
      title: 'The Twilight Zone',
      author: 'Vitality Wellness',
      durationMinutes: 15,
      audioUrl: 'https://cdn.pixabay.com/audio/2022/03/10/audio_2c99e1c3bf.mp3',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD7S6V88CXeyaNbl-Li49ZFPateYrgGTQBvnSI5Ae8AOOoHyilVDp2QhGc8ZbSv6Ql0K0Vjy12z9hWfUAL4xd-xr4BwJB2GfDaeLGUfr9LbEjtjE6ckvGeJSQwB29gqOWwlYkYKv5gaVWwE9X_tqMhnZF-2pXnVk77WyZiGvs2sXXTgfSLAHGeI2iZDUascLRVpaJNmevcbA8hH9n-Sq87-ra3EzEishh6xyRo-Pb7GrAu7y7WijejQRQ',
      isPremium: false,
      isDailyPick: false,
      category: 'Sleep',
    },
    {
      title: 'Retrain Your Brain',
      author: 'Vitality Wellness',
      durationMinutes: 20,
      audioUrl: 'https://cdn.pixabay.com/audio/2022/03/10/audio_2c99e1c3bf.mp3',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBqmfjBTQs_F2Z1kvhrYwXFs3PD2lv6YmdCHJYBd6zdJX2xM0ewbCDfhf5FEA2DlSiyTtXge2mJmiGNJRjatRxBzM6onqIIaHc4dxoikDUM45Zq_Lqfke9sbr0xp_3QfBy1qOeooiRpygdx_E00Mphy0d1rKZko_8jnD-GK9WYryHbkznKcPSpW2HPzk41nPCcI0IdWuOT8pTA43vNfdqGPOdGsklO1NUyp8Z_LPJPmooIfMXpi4emnGw',
      isPremium: true,
      isDailyPick: false,
      category: 'Focus',
    },
    {
      title: 'A Meditation Lullaby',
      author: 'Vitality Wellness',
      durationMinutes: 30,
      audioUrl: 'https://cdn.pixabay.com/audio/2022/03/10/audio_2c99e1c3bf.mp3',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBNvwA7kqW92WN56g5TvG-Iu7ZaGqNb_AUFkmWaO3m4AK3QJh6DTEmWMqyMh21BrHcATDamsdQ8G79kNjBpMWIjav-gao-wzdxwK4AWWbvbB-3NtMgxoIPm_TtBjQmoyuzN82aHw4pA2Jov6TmIQIdaWbQuctW13ZyuDROEp3bcMGceJ9utzTztwbBX7V8H7oyq6C9eVRzbM4asGNCynryQ6T7Iomv-fAis5gTnQgDrBsF2d1fBIk0YeA',
      isPremium: true,
      isDailyPick: false,
      category: 'Sleep',
    },
  ]);

  console.log('[seed] creating community leaderboard...');
  await CommunityMember.insertMany([
    { name: 'Grace', avatarUrl: GRACE_AVATAR, steps: 9890, isCurrentUser: true },
    {
      name: 'Liam Carter',
      avatarUrl: 'https://images.unsplash.com/photo-1695927621677-ec96e048dce2?crop=entropy&cs=srgb&fm=jpg&q=85',
      steps: 12430,
      isCurrentUser: false,
    },
    {
      name: 'Sofia Reyes',
      avatarUrl: 'https://images.unsplash.com/photo-1662850886700-4ec19bd30d11?crop=entropy&cs=srgb&fm=jpg&q=85',
      steps: 11020,
      isCurrentUser: false,
    },
    {
      name: 'Maya Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1589729132389-8f0e0b55b91e?crop=entropy&cs=srgb&fm=jpg&q=85',
      steps: 8760,
      isCurrentUser: false,
    },
    {
      name: 'Noah Park',
      avatarUrl: 'https://images.unsplash.com/photo-1571893714939-85a8e97c329d?crop=entropy&cs=srgb&fm=jpg&q=85',
      steps: 7210,
      isCurrentUser: false,
    },
  ]);

  console.log('[seed] creating reminders...');
  await Reminder.insertMany([
    { userId: grace._id, title: 'Log your meals', subtitle: 'Track breakfast before 9am', time: '08:00', enabled: true },
    { userId: grace._id, title: 'Evening walk', subtitle: '20 min outdoor walk', time: '18:00', enabled: true },
    { userId: grace._id, title: 'Drink water', subtitle: 'Stay hydrated', time: '14:00', enabled: false },
  ]);

  console.log('[seed] done.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[seed] failed', err);
  process.exit(1);
});
