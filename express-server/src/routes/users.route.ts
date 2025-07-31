import { Router } from 'express';
import { UserController } from '@controllers/users.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

export class UserRoute implements Routes {
  public path = '/users';
  public router = Router();
  public user = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/checkUserExisted`, this.user.checkUserExisted);
    this.router.post(`${this.path}/register`, this.user.register);
    this.router.get(`${this.path}/e2ee-keys`, AuthMiddleware, this.user.getRecoveryKey);
  }
}
