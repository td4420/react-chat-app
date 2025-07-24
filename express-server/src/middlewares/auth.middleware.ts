import authAdmin from '@/config/firebase';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import { PrismaClient } from '@prisma/client';
import { NextFunction, Response } from 'express';

const getAuthorization = (req: RequestWithUser) => {
  const coockie = req.cookies['Authorization'];
  if (coockie) return coockie;

  const header = req.header('Authorization');
  if (header) return header.split('Bearer ')[1];

  return null;
};

export const AuthMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = getAuthorization(req);
    if (Authorization) {
      await authAdmin
        .verifyIdToken(Authorization)
        .then(async decodedIdToken => {
          const { email } = decodedIdToken;
          const users = new PrismaClient().user;
          const findUser = await users.findUnique({ where: { email: email } });
          if (findUser) {
            req.user = findUser;
            next();
          } else {
            next(new HttpException(401, 'Wrong authentication token'));
          }
        })
        .catch(error => {
          console.error('Firebase token verification failed:', error);
          next(new HttpException(401, 'Invalid authentication token'));
        });
    } else {
      next(new HttpException(404, 'Authentication token missing'));
    }
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};
