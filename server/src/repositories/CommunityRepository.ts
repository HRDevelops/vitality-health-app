import { CommunityMember, ICommunityMember } from '../models/CommunityMember';

export class CommunityRepository {
  async findAllRankedByStepsDesc(): Promise<ICommunityMember[]> {
    return CommunityMember.find().sort({ steps: -1 }).exec();
  }
}

export const communityRepository = new CommunityRepository();
