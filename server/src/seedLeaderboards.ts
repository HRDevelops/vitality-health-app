import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });
dotenv.config();

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { University } from './models/University';
import { Team } from './models/Team';
import { User } from './models/User';
import { MoveActivity } from './models/MoveActivity';

export async function seedCampusLeaderboards() {
  await connectDB();
  console.log('[seedCampus] Populating universities and teams...');

  // 1. Universities
  const universitiesData = [
    {
      name: 'National University of Singapore',
      shortCode: 'NUS',
      logoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Nanyang Technological University',
      shortCode: 'NTU',
      logoUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Singapore Management University',
      shortCode: 'SMU',
      logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Universiti Malaya',
      shortCode: 'UM',
      logoUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=200&auto=format&fit=crop&q=80',
    },
  ];

  const universities: Record<string, any> = {};
  for (const u of universitiesData) {
    let doc = await University.findOne({ name: u.name });
    if (!doc) {
      doc = await University.create(u);
    }
    universities[u.shortCode] = doc;
  }

  // 2. Teams
  const teamsData = [
    {
      name: 'NUS Striders',
      universityId: universities['NUS']._id,
      memberCount: 2,
    },
    {
      name: 'NTU Velocity',
      universityId: universities['NTU']._id,
      memberCount: 1,
    },
    {
      name: 'SMU Trailblazers',
      universityId: universities['SMU']._id,
      memberCount: 1,
    },
  ];

  const teams: Record<string, any> = {};
  for (const t of teamsData) {
    let doc = await Team.findOne({ name: t.name, universityId: t.universityId });
    if (!doc) {
      doc = await Team.create(t);
    }
    teams[t.name] = doc;
  }

  // 3. Link Grace to NUS & NUS Striders
  let grace = await User.findOne({ email: 'grace.user@email.com' });
  if (grace) {
    grace.universityId = universities['NUS']._id;
    grace.teamId = teams['NUS Striders']._id;
    await grace.save();
    console.log('[seedCampus] Linked Grace to NUS & NUS Striders');
  }

  // 4. Create or update peer student users
  const defaultPasswordHash = await bcrypt.hash('12345678', 10);
  const students = [
    {
      name: 'Liam Carter',
      email: 'liam.carter@campus.edu',
      passwordHash: defaultPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      universityId: universities['NTU']._id,
      teamId: teams['NTU Velocity']._id,
    },
    {
      name: 'Sofia Reyes',
      email: 'sofia.reyes@campus.edu',
      passwordHash: defaultPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      universityId: universities['SMU']._id,
      teamId: teams['SMU Trailblazers']._id,
    },
    {
      name: 'Marcus Vance',
      email: 'marcus.vance@campus.edu',
      passwordHash: defaultPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      universityId: universities['NUS']._id,
      teamId: teams['NUS Striders']._id,
      strikeCount: 1,
    },
    {
      name: 'Chloe Tan',
      email: 'chloe.tan@campus.edu',
      passwordHash: defaultPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      universityId: universities['UM']._id,
      teamId: null,
    },
  ];

  const studentDocs: Record<string, any> = {};
  for (const s of students) {
    let doc = await User.findOne({ email: s.email });
    if (!doc) {
      doc = await User.create(s);
    } else {
      doc.universityId = s.universityId;
      doc.teamId = s.teamId as any;
      await doc.save();
    }
    studentDocs[s.name] = doc;
  }

  // 5. Seed verified and test Move activities
  const now = new Date();
  const sampleActivities = [
    // Grace verified activities
    ...(grace
      ? [
          {
            userId: grace._id,
            activityType: 'WALKATHON',
            distanceKm: 8.5,
            durationMinutes: 55,
            averagePaceKmh: 9.27,
            co2SavingsKg: 1.632,
            isFlagged: false,
            loggedAt: new Date(now.getTime() - 1 * 86400000),
          },
          {
            userId: grace._id,
            activityType: 'CYCLING',
            distanceKm: 18.0,
            durationMinutes: 35,
            averagePaceKmh: 30.85,
            co2SavingsKg: 3.456,
            isFlagged: false,
            loggedAt: new Date(now.getTime() - 2 * 86400000),
          },
        ]
      : []),

    // Liam (NTU - top cyclist)
    {
      userId: studentDocs['Liam Carter']._id,
      activityType: 'CYCLING',
      distanceKm: 24.5,
      durationMinutes: 45,
      averagePaceKmh: 32.66,
      co2SavingsKg: 4.704,
      isFlagged: false,
      loggedAt: new Date(now.getTime() - 1 * 86400000),
    },
    {
      userId: studentDocs['Liam Carter']._id,
      activityType: 'CYCLING',
      distanceKm: 12.0,
      durationMinutes: 25,
      averagePaceKmh: 28.8,
      co2SavingsKg: 2.304,
      isFlagged: false,
      loggedAt: new Date(now.getTime() - 3 * 86400000),
    },

    // Sofia (SMU)
    {
      userId: studentDocs['Sofia Reyes']._id,
      activityType: 'WALKATHON',
      distanceKm: 11.2,
      durationMinutes: 70,
      averagePaceKmh: 9.6,
      co2SavingsKg: 2.15,
      isFlagged: false,
      loggedAt: new Date(now.getTime() - 1 * 86400000),
    },
    {
      userId: studentDocs['Sofia Reyes']._id,
      activityType: 'CYCLING',
      distanceKm: 14.5,
      durationMinutes: 30,
      averagePaceKmh: 29.0,
      co2SavingsKg: 2.784,
      isFlagged: false,
      loggedAt: new Date(now.getTime() - 2 * 86400000),
    },

    // Marcus (NUS - 1 verified, 1 motorized FRAUD)
    {
      userId: studentDocs['Marcus Vance']._id,
      activityType: 'WALKATHON',
      distanceKm: 6.0,
      durationMinutes: 45,
      averagePaceKmh: 8.0,
      co2SavingsKg: 1.152,
      isFlagged: false,
      loggedAt: new Date(now.getTime() - 2 * 86400000),
    },
    {
      userId: studentDocs['Marcus Vance']._id,
      activityType: 'WALKATHON',
      distanceKm: 30.0,
      durationMinutes: 30,
      averagePaceKmh: 60.0,
      co2SavingsKg: 0,
      isFlagged: true,
      flagReason: 'IMPLAUSIBLE_PACE_EXCEEDS_HUMAN_THRESHOLD',
      loggedAt: new Date(now.getTime() - 1 * 86400000),
    },

    // Chloe (UM)
    {
      userId: studentDocs['Chloe Tan']._id,
      activityType: 'WALKATHON',
      distanceKm: 7.2,
      durationMinutes: 50,
      averagePaceKmh: 8.64,
      co2SavingsKg: 1.382,
      isFlagged: false,
      loggedAt: new Date(now.getTime() - 1 * 86400000),
    },
  ];

  for (const act of sampleActivities) {
    const existing = await MoveActivity.findOne({
      userId: act.userId,
      distanceKm: act.distanceKm,
      loggedAt: { $gte: new Date(act.loggedAt.getTime() - 60000), $lte: new Date(act.loggedAt.getTime() + 60000) },
    });
    if (!existing) {
      await MoveActivity.create(act);
    }
  }

  // Update memberCounts on teams
  for (const teamKey of Object.keys(teams)) {
    const t = teams[teamKey];
    const count = await User.countDocuments({ teamId: t._id });
    t.memberCount = count;
    await t.save();
  }

  console.log('[seedCampus] Seeding completed successfully!');
}

if (require.main === module) {
  seedCampusLeaderboards()
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
