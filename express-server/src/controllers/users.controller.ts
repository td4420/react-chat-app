import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { UserService } from '@services/users.service';

export class UserController {
  public user = Container.get(UserService);

  public checkUserExisted = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userEmail }: { userEmail: string } = req.body;
      const user = await this.user.findUniqueUser({
        where: {
          email: userEmail,
        },
      });

      res.status(201).json({
        data: {
          isExisted: !!user,
        },
        success: true,
      });
    } catch (error) {
      next(error);
    }
  };
}
