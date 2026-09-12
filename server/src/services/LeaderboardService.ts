import { Types } from 'mongoose';
import { MoveActivity } from '../models/MoveActivity';
import { User, IUser } from '../models/User';
import { University, IUniversity } from '../models/University';
import { Team, ITeam } from '../models/Team';

export type LeaderboardTimeframe = 'weekly' | 'all_time';

export interface LeaderboardEntryDTO {
  rank: number;
  id: string;
  name: string;
  avatarUrl?: string;
  logoUrl?: string;
  subtitle?: string;
  universityName?: string;
  universityShortCode?: string;
  teamName?: string;
  memberCount?: number;
  totalKm: number;
  totalCo2Kg: number;
  activityCount: number;
  isCurrent?: boolean;
}

export class LeaderboardService {
  /**
   * Aggregate individual student leaderboard based on verified Move activities
   */
  async getIndividualLeaderboard(
    timeframe: LeaderboardTimeframe = 'all_time',
    limit = 20,
    currentUserId?: string
  ): Promise<{
    entries: LeaderboardEntryDTO[];
    currentUserEntry?: LeaderboardEntryDTO | null;
    timeframe: LeaderboardTimeframe;
    tier: 'INDIVIDUAL';
  }> {
    const matchFilter: any = { isFlagged: { $ne: true } };

    if (timeframe === 'weekly') {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      matchFilter.loggedAt = { $gte: oneWeekAgo };
    }

    const aggregated = await MoveActivity.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$userId',
          totalKm: { $sum: '$distanceKm' },
          totalCo2Kg: { $sum: '$co2SavingsKg' },
          activityCount: { $sum: 1 },
        },
      },
      { $sort: { totalKm: -1, totalCo2Kg: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'universities',
          localField: 'user.universityId',
          foreignField: '_id',
          as: 'university',
        },
      },
      {
        $lookup: {
          from: 'teams',
          localField: 'user.teamId',
          foreignField: '_id',
          as: 'team',
        },
      },
      {
        $project: {
          _id: 1,
          name: '$user.name',
          avatarUrl: '$user.avatarUrl',
          universityName: { $arrayElemAt: ['$university.name', 0] },
          universityShortCode: { $arrayElemAt: ['$university.shortCode', 0] },
          teamName: { $arrayElemAt: ['$team.name', 0] },
          totalKm: { $round: ['$totalKm', 2] },
          totalCo2Kg: { $round: ['$totalCo2Kg', 3] },
          activityCount: 1,
        },
      },
    ]);

    const allRanked: LeaderboardEntryDTO[] = aggregated.map((item, index) => ({
      rank: index + 1,
      id: item._id.toString(),
      name: item.name || 'Anonymous Student',
      avatarUrl: item.avatarUrl || '',
      subtitle: item.universityShortCode
        ? `${item.universityShortCode}${item.teamName ? ` · ${item.teamName}` : ''}`
        : item.teamName || 'Independent',
      universityName: item.universityName,
      universityShortCode: item.universityShortCode,
      teamName: item.teamName,
      totalKm: item.totalKm || 0,
      totalCo2Kg: item.totalCo2Kg || 0,
      activityCount: item.activityCount || 0,
      isCurrent: currentUserId ? item._id.toString() === currentUserId.toString() : false,
    }));

    let currentUserEntry: LeaderboardEntryDTO | null = null;
    if (currentUserId) {
      const found = allRanked.find((entry) => entry.id === currentUserId.toString());
      if (found) {
        currentUserEntry = { ...found, isCurrent: true };
      } else {
        // User has 0 verified activity
        const user = await User.findById(currentUserId)
          .populate('universityId')
          .populate('teamId')
          .lean();
        if (user) {
          const uni = user.universityId as any;
          const team = user.teamId as any;
          currentUserEntry = {
            rank: allRanked.length + 1,
            id: currentUserId,
            name: user.name,
            avatarUrl: user.avatarUrl,
            subtitle: uni?.shortCode
              ? `${uni.shortCode}${team?.name ? ` · ${team.name}` : ''}`
              : team?.name || 'Independent',
            universityName: uni?.name,
            universityShortCode: uni?.shortCode,
            teamName: team?.name,
            totalKm: 0,
            totalCo2Kg: 0,
            activityCount: 0,
            isCurrent: true,
          };
        }
      }
    }

    return {
      entries: allRanked.slice(0, limit),
      currentUserEntry,
      timeframe,
      tier: 'INDIVIDUAL',
    };
  }

  /**
   * Aggregate student teams leaderboard based on member verified activities
   */
  async getTeamLeaderboard(
    universityId?: string,
    timeframe: LeaderboardTimeframe = 'all_time',
    limit = 20,
    currentTeamId?: string
  ): Promise<{
    entries: LeaderboardEntryDTO[];
    currentTeamEntry?: LeaderboardEntryDTO | null;
    timeframe: LeaderboardTimeframe;
    tier: 'TEAMS';
  }> {
    const matchFilter: any = { isFlagged: { $ne: true } };

    if (timeframe === 'weekly') {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      matchFilter.loggedAt = { $gte: oneWeekAgo };
    }

    const teamFilter: any = {};
    if (universityId) {
      teamFilter.universityId = new Types.ObjectId(universityId);
    }
    const allTeams = await Team.find(teamFilter).populate('universityId').lean();

    // Aggregate MoveActivity joined with users to get team metrics
    const aggregated = await MoveActivity.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $match: { 'user.teamId': { $ne: null } } },
      {
        $group: {
          _id: '$user.teamId',
          totalKm: { $sum: '$distanceKm' },
          totalCo2Kg: { $sum: '$co2SavingsKg' },
          activityCount: { $sum: 1 },
          activeMembers: { $addToSet: '$userId' },
        },
      },
    ]);

    const metricsMap = new Map<string, { totalKm: number; totalCo2Kg: number; activityCount: number; activeMembersCount: number }>();
    aggregated.forEach((item) => {
      metricsMap.set(item._id.toString(), {
        totalKm: Number(item.totalKm.toFixed(2)),
        totalCo2Kg: Number(item.totalCo2Kg.toFixed(3)),
        activityCount: item.activityCount,
        activeMembersCount: item.activeMembers?.length || 0,
      });
    });

    const combined = allTeams.map((team) => {
      const stats = metricsMap.get(team._id.toString()) || {
        totalKm: 0,
        totalCo2Kg: 0,
        activityCount: 0,
        activeMembersCount: 0,
      };
      const uni = team.universityId as any;
      return {
        id: team._id.toString(),
        name: team.name,
        universityName: uni?.name || '',
        universityShortCode: uni?.shortCode || '',
        logoUrl: uni?.logoUrl || '',
        memberCount: team.memberCount || 1,
        totalKm: stats.totalKm,
        totalCo2Kg: stats.totalCo2Kg,
        activityCount: stats.activityCount,
      };
    });

    combined.sort((a, b) => b.totalKm - a.totalKm || b.totalCo2Kg - a.totalCo2Kg);

    const allRanked: LeaderboardEntryDTO[] = combined.map((item, index) => ({
      rank: index + 1,
      id: item.id,
      name: item.name,
      subtitle: `${item.universityShortCode || item.universityName || 'Campus'} · ${item.memberCount} ${item.memberCount === 1 ? 'member' : 'members'}`,
      universityName: item.universityName,
      universityShortCode: item.universityShortCode,
      memberCount: item.memberCount,
      totalKm: item.totalKm,
      totalCo2Kg: item.totalCo2Kg,
      activityCount: item.activityCount,
      isCurrent: currentTeamId ? item.id === currentTeamId.toString() : false,
    }));

    let currentTeamEntry: LeaderboardEntryDTO | null = null;
    if (currentTeamId) {
      const found = allRanked.find((entry) => entry.id === currentTeamId.toString());
      if (found) {
        currentTeamEntry = { ...found, isCurrent: true };
      }
    }

    return {
      entries: allRanked.slice(0, limit),
      currentTeamEntry,
      timeframe,
      tier: 'TEAMS',
    };
  }

  /**
   * Aggregate campus/university leaderboard based on student verified activities
   */
  async getUniversityLeaderboard(
    timeframe: LeaderboardTimeframe = 'all_time',
    limit = 20,
    currentUniversityId?: string
  ): Promise<{
    entries: LeaderboardEntryDTO[];
    currentUniversityEntry?: LeaderboardEntryDTO | null;
    timeframe: LeaderboardTimeframe;
    tier: 'UNIVERSITIES';
  }> {
    const matchFilter: any = { isFlagged: { $ne: true } };

    if (timeframe === 'weekly') {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      matchFilter.loggedAt = { $gte: oneWeekAgo };
    }

    const allUniversities = await University.find({}).lean();

    const aggregated = await MoveActivity.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $match: { 'user.universityId': { $ne: null } } },
      {
        $group: {
          _id: '$user.universityId',
          totalKm: { $sum: '$distanceKm' },
          totalCo2Kg: { $sum: '$co2SavingsKg' },
          activityCount: { $sum: 1 },
          activeStudents: { $addToSet: '$userId' },
        },
      },
    ]);

    const metricsMap = new Map<string, { totalKm: number; totalCo2Kg: number; activityCount: number; activeStudentsCount: number }>();
    aggregated.forEach((item) => {
      metricsMap.set(item._id.toString(), {
        totalKm: Number(item.totalKm.toFixed(2)),
        totalCo2Kg: Number(item.totalCo2Kg.toFixed(3)),
        activityCount: item.activityCount,
        activeStudentsCount: item.activeStudents?.length || 0,
      });
    });

    const combined = allUniversities.map((uni) => {
      const stats = metricsMap.get(uni._id.toString()) || {
        totalKm: 0,
        totalCo2Kg: 0,
        activityCount: 0,
        activeStudentsCount: 0,
      };
      return {
        id: uni._id.toString(),
        name: uni.name,
        shortCode: uni.shortCode,
        logoUrl: uni.logoUrl,
        memberCount: stats.activeStudentsCount,
        totalKm: stats.totalKm,
        totalCo2Kg: stats.totalCo2Kg,
        activityCount: stats.activityCount,
      };
    });

    combined.sort((a, b) => b.totalKm - a.totalKm || b.totalCo2Kg - a.totalCo2Kg);

    const allRanked: LeaderboardEntryDTO[] = combined.map((item, index) => ({
      rank: index + 1,
      id: item.id,
      name: item.name,
      logoUrl: item.logoUrl,
      subtitle: `${item.shortCode} · ${item.memberCount} active ${item.memberCount === 1 ? 'student' : 'students'}`,
      universityShortCode: item.shortCode,
      memberCount: item.memberCount,
      totalKm: item.totalKm,
      totalCo2Kg: item.totalCo2Kg,
      activityCount: item.activityCount,
      isCurrent: currentUniversityId ? item.id === currentUniversityId.toString() : false,
    }));

    let currentUniversityEntry: LeaderboardEntryDTO | null = null;
    if (currentUniversityId) {
      const found = allRanked.find((entry) => entry.id === currentUniversityId.toString());
      if (found) {
        currentUniversityEntry = { ...found, isCurrent: true };
      }
    }

    return {
      entries: allRanked.slice(0, limit),
      currentUniversityEntry,
      timeframe,
      tier: 'UNIVERSITIES',
    };
  }

  /**
   * User joins a team
   */
  async joinTeam(userId: string, teamId: string): Promise<{ user: IUser; team: ITeam }> {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.teamId = team._id;
    user.universityId = team.universityId;
    await user.save();

    // Recalculate member count
    const memberCount = await User.countDocuments({ teamId: team._id });
    team.memberCount = memberCount;
    await team.save();

    return { user, team };
  }

  /**
   * User creates a team
   */
  async createTeam(
    userId: string,
    data: { name: string; universityId: string }
  ): Promise<{ team: ITeam; user: IUser }> {
    const university = await University.findById(data.universityId);
    if (!university) {
      throw new Error('University not found');
    }

    const existingTeam = await Team.findOne({
      name: { $regex: new RegExp(`^${data.name.trim()}$`, 'i') },
      universityId: university._id,
    });
    if (existingTeam) {
      throw new Error('A team with this name already exists at this university');
    }

    const team = await Team.create({
      name: data.name.trim(),
      universityId: university._id,
      captainId: new Types.ObjectId(userId),
      memberCount: 1,
      totalKm: 0,
      totalCo2Kg: 0,
    });

    const user = await User.findById(userId);
    if (user) {
      user.teamId = team._id;
      user.universityId = university._id;
      await user.save();
    }

    return { team, user: user! };
  }

  /**
   * List all universities
   */
  async getUniversities(): Promise<IUniversity[]> {
    return University.find({}).sort({ name: 1 });
  }

  /**
   * List teams, optionally by university
   */
  async getTeams(universityId?: string): Promise<ITeam[]> {
    const filter: any = {};
    if (universityId) {
      filter.universityId = new Types.ObjectId(universityId);
    }
    return Team.find(filter).populate('universityId').sort({ name: 1 });
  }
}

export const leaderboardService = new LeaderboardService();
