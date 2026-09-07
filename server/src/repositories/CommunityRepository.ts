import { CommunityMember, ICommunityMember } from '../models/CommunityMember';

export class CommunityRepository {
  async findAll(): Promise<ICommunityMember[]> {
    return CommunityMember.find().exec();
  }
}

export const communityRepository = new CommunityRepository();
