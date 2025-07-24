import authAdmin from '@/config/firebase';
import { MAX_MESSAGE, MAX_ROOM } from '@/utils/const';
import { GetRoomDetailResult } from '@/utils/type';
import { Message, Prisma, PrismaClient, Room, RoomMember, User } from '@prisma/client';
import { Service } from 'typedi';

@Service()
export class RoomService {
  private prismaClient = new PrismaClient();
  public room = this.prismaClient.room;
  public roomMember = this.prismaClient.roomMember;
  public message = this.prismaClient.message;
  public user = this.prismaClient.user;

  public async findAllRoom(userId: string) {
    const roomMembers = await this.roomMember.findMany({
      where: {
        memberId: userId,
      },
    });

    const userRooms = await this.room.findMany({
      where: {
        id: {
          in: roomMembers.map(member => member.roomId),
        },
      },
      take: MAX_ROOM,
    });

    const result = [];

    await Promise.all(
      userRooms.map(async userRoom => {
        const roomMessages = await this.getRoomMessage(userRoom.id);
        const roomMembers = await this.getRoomMember(userRoom.id);
        result.push({
          ...userRoom,
          messages: roomMessages,
          members: roomMembers,
        });
      }),
    );

    return result;
  }

  private async getRoomMember(roomId: string) {
    const roomMembers = await this.roomMember.findMany({
      where: {
        roomId,
      },
    });

    return await this.user.findMany({
      where: {
        id: {
          in: roomMembers.map(roomMember => roomMember.memberId),
        },
      },
    });
  }

  private async getRoomMessage(roomId: string) {
    return await this.message.findMany({
      where: {
        roomId,
      },
      orderBy: {
        createdAt: Prisma.SortOrder.desc,
      },
      take: MAX_MESSAGE,
    });
  }

  public async getRoomData(userId: string, roomId: string): Promise<GetRoomDetailResult> {
    const isUserInRoom = await this.roomMember.findFirst({
      where: {
        memberId: userId,
        roomId,
      },
    });

    if (!isUserInRoom) {
      return null;
    }

    const chatRoom = await this.room.findUnique({
      where: {
        id: roomId,
      },
    });

    if (!chatRoom) {
      return null;
    }

    const roomMessages = await this.getRoomMessage(roomId);
    const roomMembers = await this.getRoomMember(roomId);

    return {
      ...chatRoom,
      roomMessages,
      roomMembers,
    };
  }

  public async sendMessage(
    accessToken: string,
    roomId: string,
    hashContent: string,
    createdAt: Date,
  ): Promise<{ newMessage: Message; chatRoom: Room; members: User[] }> {
    let result: { newMessage: Message; chatRoom: Room; members: User[] } = null;
    await authAdmin
      .verifyIdToken(accessToken)
      .then(async decodedIdToken => {
        const { email } = decodedIdToken;
        const findUser = await this.user.findUnique({ where: { email: email } });

        if (!findUser) {
          throw new Error('User not found');
        }

        const { id: userId } = findUser;
        const isUserInRoom = await this.roomMember.findFirst({
          where: {
            memberId: userId,
            roomId,
          },
        });

        if (!isUserInRoom) {
          throw new Error('User can not send message at this room');
        }

        const chatRoom = await this.room.findUnique({
          where: {
            id: roomId,
          },
        });

        if (!chatRoom) {
          throw new Error('Chat room not found');
        }

        const newMessage: Message = await this.message.create({
          data: {
            createdAt,
            hashContent,
            senderId: userId,
            roomId,
          },
        });

        const roomMembers = await this.getRoomMember(roomId);

        result = {
          newMessage,
          chatRoom,
          members: roomMembers,
        };
      })
      .catch(error => {
        console.error('Error when send message:', error);
      });

    return result;
  }
}
