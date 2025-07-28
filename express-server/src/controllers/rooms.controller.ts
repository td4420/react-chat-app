import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { RoomService } from '@services/rooms.service';
import { User } from '@prisma/client';

export class RoomController {
  public room = Container.get(RoomService);

  public findAllRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user: User = req['user'];
      const rooms = await this.room.findAllRoom(user.id);

      res.status(201).json({
        data: rooms,
        success: true,
      });
    } catch (error) {
      next(error);
    }
  };

  public search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user: User = req['user'];
      const searchKey = req.params.searchKey;
      const result = await this.room.search(user.id, searchKey);

      res.status(201).json({
        data: {
          ...result,
        },
        success: true,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  public getDirectChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user: User = req['user'];
      const uuid = req.params.uuid;
      const result = await this.room.getDirectChat(user.id, uuid);

      res.status(201).json({
        data: {
          ...result,
        },
        success: true,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
