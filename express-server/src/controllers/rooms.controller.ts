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

  public getRoomDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user: User = req['user'];
      const roomId = req.params.roomId;
      const roomData = await this.room.getRoomData(user.id, roomId);

      res.status(201).json({
        data: roomData,
        success: true,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
