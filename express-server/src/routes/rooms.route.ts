import { RoomController } from '@/controllers/rooms.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';

export class RoomRoute implements Routes {
  public path = '/rooms';
  public router = Router();
  public room = new RoomController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, AuthMiddleware, this.room.findAllRoom);
    this.router.get(`${this.path}/search/:searchKey`, AuthMiddleware, this.room.search);
    this.router.get(`${this.path}/direct/:uuid`, AuthMiddleware, this.room.getDirectChat);
  }
}
