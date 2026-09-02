import { communityRepository } from '../repositories/CommunityRepository';

export class CommunityService {
  async getLeaderboard() {
    const members = await communityRepository.findAllRankedByStepsDesc();
    return members.map((m, index) => ({ ...m.toJSON(), rank: index + 1 }));
  }
}

export const communityService = new CommunityService();
