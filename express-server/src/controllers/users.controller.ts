import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { UserService } from '@services/users.service';
import authAdmin from '@/config/firebase';
import { User, UserRecoveryKey } from '@prisma/client';

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

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, name, avatar, password, publicKey, encryptedPassphrase, encryptedPrivateKey } = req.body;

      const user = await this.user.findUniqueUser({
        where: {
          email: email,
        },
      });

      if (user) {
        res.status(201).json({
          data: {
            message: 'Customer account is existed',
          },
          success: false,
        });

        return;
      }

      try {
        await authAdmin.getUserByEmail(email);
        res.status(201).json({
          data: {
            message: 'Customer account is existed',
          },
          success: false,
        });

        return;
      } catch (error) {
        //Create account if firebase user not existed
        const newUser = await authAdmin.createUser({
          email,
          emailVerified: false,
          password: password,
          displayName: name,
          photoURL: avatar || undefined,
          disabled: false,
        });

        await this.user.registerUser({
          data: {
            id: newUser.uid,
            email,
            avatar,
            name,
            publicKey,
            recoveryKey: {
              create: {
                encryptedPassphrase,
                encryptedPrivateKey,
              },
            },
          },
        });

        res.status(201).json({
          data: {
            message: 'Register user success',
          },
          success: true,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  public getRecoveryKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req['user'];

      const user = (await this.user.findUniqueUser({
        where: {
          email: userData.email,
        },
        include: {
          recoveryKey: {
            select: {
              encryptedPassphrase: true,
              encryptedPrivateKey: true,
            },
          },
        },
      })) as User & {
        recoveryKey: UserRecoveryKey;
      };

      res.status(200).json({
        data: {
          encryptedPassphrase: user.recoveryKey.encryptedPassphrase,
          encryptedPrivateKey: user.recoveryKey.encryptedPrivateKey,
        },
        success: true,
      });
    } catch (error) {
      next(error);
    }
  };
}
