import { Types } from 'mongoose';
import { CareCircleLink, ICareCircleLink, RelationshipType } from '../models/CareCircleLink';
import { HealthMetric, IHealthMetric } from '../models/HealthMetric';
import { User, IUser } from '../models/User';

export interface MonitoredMemberSummary {
  id: string; // subjectId
  linkId: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  relationshipType: RelationshipType;
  accessLevel: 'VIEW_VITALS' | 'EMERGENCY_ONLY';
  latestBp?: {
    systolic?: number;
    diastolic?: number;
    pulse?: number;
    category: string;
    uiToken: string;
    isCriticalAlert: boolean;
    loggedAt: Date;
  } | null;
  latestGlucose?: {
    glucoseValue?: number;
    glucoseUnit: string;
    isFasting: boolean;
    category: string;
    uiToken: string;
    isCriticalAlert: boolean;
    loggedAt: Date;
  } | null;
  hasActiveCrisis: boolean;
  crisisMessage?: string | null;
  lastSyncAt: Date | null;
}

export class CareCircleService {
  /**
   * Retrieves all linked family members for a diaspora observer with latest vitals and crisis flags
   */
  async getMonitoredMembers(observerId: string): Promise<MonitoredMemberSummary[]> {
    const links = await CareCircleLink.find({
      observerId: new Types.ObjectId(observerId),
      status: 'ACCEPTED',
    })
      .populate('subjectId')
      .sort({ updatedAt: -1 });

    const results: MonitoredMemberSummary[] = [];

    for (const link of links) {
      const subject = link.subjectId as any as IUser;
      if (!subject) continue;

      // 1. Latest BP reading
      const latestBp = await HealthMetric.findOne({
        userId: subject._id,
        type: 'blood_pressure',
      }).sort({ loggedAt: -1 });

      // 2. Latest Glucose reading
      const latestGlucose = await HealthMetric.findOne({
        userId: subject._id,
        type: 'blood_glucose',
      }).sort({ loggedAt: -1 });

      // 3. Crisis flag evaluation
      let hasActiveCrisis = false;
      let crisisMessage: string | null = null;

      if (latestBp) {
        if (
          latestBp.isCriticalAlert ||
          (latestBp.systolic && latestBp.systolic > 180) ||
          (latestBp.diastolic && latestBp.diastolic > 120)
        ) {
          hasActiveCrisis = true;
          crisisMessage = `Urgent: ${subject.name} logged a critical BP alert (${latestBp.systolic}/${latestBp.diastolic} mmHg). Urgent medical consultation advised.`;
        }
      }

      if (latestGlucose && !hasActiveCrisis) {
        if (latestGlucose.glucoseValue && latestGlucose.glucoseValue < 70) {
          hasActiveCrisis = true;
          crisisMessage = `Urgent: ${subject.name} logged severe hypoglycemia (${latestGlucose.glucoseValue} mg/dL). Immediate fast-acting glucose required.`;
        }
      }

      // Calculate lastSyncAt
      const timestamps = [
        latestBp?.loggedAt,
        latestGlucose?.loggedAt,
        link.updatedAt,
      ].filter(Boolean) as Date[];

      const lastSyncAt = timestamps.length
        ? new Date(Math.max(...timestamps.map((t) => new Date(t).getTime())))
        : null;

      results.push({
        id: subject._id.toString(),
        linkId: link._id.toString(),
        name: subject.name,
        email: subject.email,
        avatarUrl: subject.avatarUrl,
        relationshipType: link.relationshipType,
        accessLevel: link.accessLevel,
        latestBp: latestBp
          ? {
              systolic: latestBp.systolic,
              diastolic: latestBp.diastolic,
              pulse: latestBp.pulse,
              category: latestBp.category,
              uiToken: latestBp.uiToken,
              isCriticalAlert: latestBp.isCriticalAlert,
              loggedAt: latestBp.loggedAt,
            }
          : null,
        latestGlucose: latestGlucose
          ? {
              glucoseValue: latestGlucose.glucoseValue,
              glucoseUnit: latestGlucose.glucoseUnit,
              isFasting: latestGlucose.isFasting,
              category: latestGlucose.category,
              uiToken: latestGlucose.uiToken,
              isCriticalAlert: latestGlucose.isCriticalAlert,
              loggedAt: latestGlucose.loggedAt,
            }
          : null,
        hasActiveCrisis,
        crisisMessage,
        lastSyncAt,
      });
    }

    return results;
  }

  /**
   * Retrieves 14-day history of vitals for a specific family member after verifying observer permission
   */
  async getMemberVitalHistory(
    observerId: string,
    subjectId: string,
    limit = 30
  ): Promise<{
    subject: { id: string; name: string; email: string; avatarUrl: string };
    relationshipType: RelationshipType;
    accessLevel: string;
    readings: IHealthMetric[];
  }> {
    const link = await CareCircleLink.findOne({
      observerId: new Types.ObjectId(observerId),
      subjectId: new Types.ObjectId(subjectId),
      status: 'ACCEPTED',
    });

    if (!link) {
      throw new Error('Not authorized to view clinical vitals for this family member');
    }

    const subject = await User.findById(subjectId).select('name email avatarUrl');
    if (!subject) {
      throw new Error('Family member profile not found');
    }

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const readings = await HealthMetric.find({
      userId: new Types.ObjectId(subjectId),
      loggedAt: { $gte: fourteenDaysAgo },
    })
      .sort({ loggedAt: -1 })
      .limit(limit);

    return {
      subject: {
        id: subject._id.toString(),
        name: subject.name,
        email: subject.email,
        avatarUrl: subject.avatarUrl,
      },
      relationshipType: link.relationshipType,
      accessLevel: link.accessLevel,
      readings,
    };
  }

  /**
   * Generates a 6-character uppercase pairing code for a user wishing to be monitored
   */
  async generateInviteCode(
    subjectId: string,
    relationshipType: RelationshipType = 'Relative'
  ): Promise<{ inviteCode: string; relationshipType: RelationshipType }> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Unambiguous characters
    let code = '';
    let isUnique = false;

    // Retry up to 5 times for unique code
    for (let i = 0; i < 5; i++) {
      let randomPart = '';
      for (let j = 0; j < 4; j++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      code = 'YC' + randomPart;

      const existing = await CareCircleLink.findOne({ inviteCode: code, status: 'PENDING' });
      if (!existing) {
        isUnique = true;
        break;
      }
    }

    if (!isUnique) {
      throw new Error('Could not generate unique pairing code. Please try again.');
    }

    await CareCircleLink.create({
      subjectId: new Types.ObjectId(subjectId),
      observerId: null,
      relationshipType,
      accessLevel: 'VIEW_VITALS',
      inviteCode: code,
      status: 'PENDING',
    });

    return { inviteCode: code, relationshipType };
  }

  /**
   * Connects an observer to a subject using their 6-character invite code
   */
  async connectWithCode(
    observerId: string,
    inviteCode: string,
    relationshipType?: RelationshipType
  ): Promise<MonitoredMemberSummary> {
    const normalizedCode = inviteCode.trim().toUpperCase();

    const pendingLink = await CareCircleLink.findOne({
      inviteCode: normalizedCode,
      status: 'PENDING',
    });

    if (!pendingLink) {
      throw new Error('Invalid or expired pairing code. Please verify with your family member.');
    }

    if (pendingLink.subjectId.toString() === observerId) {
      throw new Error('You cannot pair with your own invite code.');
    }

    // Check if link already exists
    const existing = await CareCircleLink.findOne({
      observerId: new Types.ObjectId(observerId),
      subjectId: pendingLink.subjectId,
      status: 'ACCEPTED',
    });

    if (existing) {
      throw new Error('You are already connected to this family member.');
    }

    // Accept and pair
    pendingLink.observerId = new Types.ObjectId(observerId);
    pendingLink.status = 'ACCEPTED';
    if (relationshipType) {
      pendingLink.relationshipType = relationshipType;
    }
    await pendingLink.save();

    // Return the newly monitored member summary
    const monitoredList = await this.getMonitoredMembers(observerId);
    const linked = monitoredList.find((m) => m.linkId === pendingLink._id.toString());
    if (!linked) {
      throw new Error('Connected successfully, but failed to fetch member profile.');
    }

    return linked;
  }

  /**
   * Revokes or cancels a family link
   */
  async revokeLink(observerId: string, linkId: string): Promise<{ success: boolean; message: string }> {
    const link = await CareCircleLink.findOne({
      _id: new Types.ObjectId(linkId),
      $or: [
        { observerId: new Types.ObjectId(observerId) },
        { subjectId: new Types.ObjectId(observerId) },
      ],
    });

    if (!link) {
      throw new Error('Care circle link not found or unauthorized');
    }

    link.status = 'REVOKED';
    await link.save();

    return { success: true, message: 'Care circle link revoked successfully' };
  }
}

export const careCircleService = new CareCircleService();
