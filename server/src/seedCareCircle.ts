import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });
dotenv.config();

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { User } from './models/User';
import { CareCircleLink } from './models/CareCircleLink';
import { HealthMetric } from './models/HealthMetric';

export async function seedCareCircle() {
  await connectDB();
  console.log('[seedCareCircle] Seeding demo diaspora family members...');

  const grace = await User.findOne({ email: 'grace.user@email.com' });
  if (!grace) {
    console.error('Grace not found, please run standard seed first');
    return;
  }

  const defaultPasswordHash = await bcrypt.hash('12345678', 10);

  // 1. Elena Sterling (Parent)
  let elena = await User.findOne({
    $or: [{ email: 'elena.sterling@family.com' }, { email: 'elena.user@family.com' }],
  });
  if (!elena) {
    elena = await User.create({
      name: 'Elena Sterling',
      email: 'elena.sterling@family.com',
      passwordHash: defaultPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      age: 58,
    });
  } else {
    elena.name = 'Elena Sterling';
    elena.email = 'elena.sterling@family.com';
    await elena.save();
  }

  // 2. Arthur Sterling (Grandparent - with Hypertensive Crisis for escalation banner test)
  let arthur = await User.findOne({
    $or: [{ email: 'arthur.sterling@family.com' }, { email: 'arthur.user@family.com' }],
  });
  if (!arthur) {
    arthur = await User.create({
      name: 'Arthur Sterling',
      email: 'arthur.sterling@family.com',
      passwordHash: defaultPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      age: 81,
    });
  } else {
    arthur.name = 'Arthur Sterling';
    arthur.email = 'arthur.sterling@family.com';
    await arthur.save();
  }

  // 3. David Sterling (Sibling - with pending pairing code)
  let david = await User.findOne({
    $or: [{ email: 'david.sterling@family.com' }, { email: 'david.user@family.com' }],
  });
  if (!david) {
    david = await User.create({
      name: 'David Sterling',
      email: 'david.sterling@family.com',
      passwordHash: defaultPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      age: 26,
    });
  } else {
    david.name = 'David Sterling';
    david.email = 'david.sterling@family.com';
    await david.save();
  }

  // 4. Seed Clinical Vitals
  const now = new Date();

  // Elena's Vitals (Stage 1 BP, Prediabetes)
  await HealthMetric.deleteMany({ userId: elena._id });
  await HealthMetric.insertMany([
    {
      userId: elena._id,
      type: 'blood_pressure',
      systolic: 138,
      diastolic: 86,
      pulse: 72,
      category: 'High — Stage 1',
      uiToken: 'Saffron',
      isCriticalAlert: false,
      notes: 'Evening resting measurement after light walk.',
      loggedAt: new Date(now.getTime() - 3 * 3600000), // 3 hrs ago
    },
    {
      userId: elena._id,
      type: 'blood_pressure',
      systolic: 134,
      diastolic: 84,
      pulse: 70,
      category: 'High — Stage 1',
      uiToken: 'Saffron',
      isCriticalAlert: false,
      notes: 'Morning measurement before medication.',
      loggedAt: new Date(now.getTime() - 24 * 3600000),
    },
    {
      userId: elena._id,
      type: 'blood_glucose',
      glucoseValue: 115,
      glucoseUnit: 'MG_DL',
      isFasting: true,
      category: 'Prediabetes',
      uiToken: 'Saffron',
      isCriticalAlert: false,
      notes: 'Fasting morning check.',
      loggedAt: new Date(now.getTime() - 12 * 3600000),
    },
  ]);

  // Arthur's Vitals (Hypertensive Crisis!)
  await HealthMetric.deleteMany({ userId: arthur._id });
  await HealthMetric.insertMany([
    {
      userId: arthur._id,
      type: 'blood_pressure',
      systolic: 184,
      diastolic: 122,
      pulse: 88,
      category: 'Hypertensive Crisis',
      uiToken: 'Clay',
      isCriticalAlert: true,
      notes: 'Feeling mild dizziness. Urged to consult local GP immediately.',
      loggedAt: new Date(now.getTime() - 1 * 3600000), // 1 hr ago
    },
    {
      userId: arthur._id,
      type: 'blood_pressure',
      systolic: 148,
      diastolic: 94,
      pulse: 80,
      category: 'High — Stage 2',
      uiToken: 'Clay',
      isCriticalAlert: false,
      notes: 'Afternoon measurement.',
      loggedAt: new Date(now.getTime() - 48 * 3600000),
    },
    {
      userId: arthur._id,
      type: 'blood_glucose',
      glucoseValue: 142,
      glucoseUnit: 'MG_DL',
      isFasting: false,
      category: 'Prediabetes',
      uiToken: 'Saffron',
      isCriticalAlert: false,
      notes: '2 hours post-lunch.',
      loggedAt: new Date(now.getTime() - 2 * 3600000),
    },
  ]);

  // 5. Connect Links to Grace
  await CareCircleLink.deleteMany({
    $or: [{ observerId: grace._id }, { subjectId: grace._id }],
  });

  // Elena: Accepted Parent link
  await CareCircleLink.create({
    observerId: grace._id,
    subjectId: elena._id,
    relationshipType: 'Parent',
    accessLevel: 'VIEW_VITALS',
    status: 'ACCEPTED',
  });

  // Arthur: Accepted Grandparent link
  await CareCircleLink.create({
    observerId: grace._id,
    subjectId: arthur._id,
    relationshipType: 'Grandparent',
    accessLevel: 'VIEW_VITALS',
    status: 'ACCEPTED',
  });

  // David: Pending invite code `YC9X4A` for testing pairing code flow
  await CareCircleLink.create({
    observerId: null,
    subjectId: david._id,
    relationshipType: 'Sibling',
    accessLevel: 'VIEW_VITALS',
    inviteCode: 'YC9X4A',
    status: 'PENDING',
  });

  console.log('[seedCareCircle] Successfully seeded Elena Sterling (Parent), Arthur Sterling (Grandparent), and David Sterling (Code: YC9X4A)');
}

if (require.main === module) {
  seedCareCircle()
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
