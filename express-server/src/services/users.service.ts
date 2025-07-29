import { Prisma, PrismaClient, User } from '@prisma/client';
import { Service } from 'typedi';

@Service()
export class UserService {
  public user = new PrismaClient().user;

  public async findUniqueUser(args: Prisma.UserFindUniqueArgs): Promise<User> {
    return await this.user.findUnique({ ...args });
  }

  public async registerUser(args: Prisma.UserCreateArgs) {
    return await this.user.create({ ...args });
  }
}
