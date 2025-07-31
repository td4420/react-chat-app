import authAdmin from '@/config/firebase';
import { MAX_MESSAGE, MAX_ROOM } from '@/utils/const';
import { NewMessagePayload, SearchResult, SendMessageResult } from '@/utils/type';
import { Message, Prisma, PrismaClient } from '@prisma/client';
import sync from 'jwt-encode';
import { Service } from 'typedi';

@Service()
export class RoomService {
  private prismaClient = new PrismaClient();
  public room = this.prismaClient.room;
  public roomMember = this.prismaClient.roomMember;
  public message = this.prismaClient.message;
  public messageKey = this.prismaClient.messageKey;
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
        messages: {
          some: {},
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

    return result.filter(room => room.messages.length > 0);
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
        createdAt: Prisma.SortOrder.asc,
      },
      include: {
        messageKey: {
          select: {
            encryptedKey: true,
            recipientId: true,
          },
        },
      },
      take: MAX_MESSAGE,
    });
  }

  public async search(userId: string, searchKey: string): Promise<SearchResult> {
    const userRooms = await this.roomMember.findMany({
      where: {
        memberId: userId,
        room: {
          name: {
            contains: searchKey,
          },
          isDirectChat: false,
        },
      },
    });

    const rooms = await this.room.findMany({
      where: {
        id: {
          in: userRooms.map(userRoom => userRoom.roomId),
        },
      },
    });

    const users = await this.user.findMany({
      where: {
        id: {
          not: userId,
        },
        name: {
          contains: searchKey,
        },
      },
    });

    return {
      rooms,
      users,
    };
  }

  public async sendMessage(eventData: NewMessagePayload): Promise<SendMessageResult> {
    let result: SendMessageResult = null;
    const { accessToken, roomId, createdAt, encryptedPayload, messageKeys, iv } = eventData;
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
            senderId: userId,
            roomId,
            encryptedPayload,
            iv,
          },
        });

        await this.messageKey.createMany({
          data: messageKeys.map(key => {
            return {
              messageId: newMessage.id,
              recipientId: key.recipientId,
              encryptedKey: key.encryptedKey,
            };
          }),
        });

        const roomMessages = await this.getRoomMessage(roomId);
        const roomMembers = await this.getRoomMember(roomId);
        const newMessageData = await this.message.findUnique({
          where: {
            id: newMessage.id,
          },
          include: {
            messageKey: {
              select: {
                id: true,
                recipientId: true,
                encryptedKey: true,
                messageId: true,
              },
            },
          },
        });

        result = {
          newMessage: {
            ...newMessageData,
          },
          roomMessages: [...roomMessages],
          chatRoom,
          members: roomMembers,
        };
      })
      .catch(error => {
        console.error('Error when send message:', error);
      });

    return result;
  }

  public async getDirectChat(userUid: string, targetUserUid: string) {
    const roomId = sync(
      {
        user: userUid,
        target: targetUserUid,
      },
      process.env.SECRET_KEY,
    );

    const roomId2 = sync(
      {
        user: targetUserUid,
        target: userUid,
      },
      process.env.SECRET_KEY,
    );

    const room = await this.room.findFirst({
      where: {
        id: {
          in: [roomId, roomId2],
        },
      },
    });

    if (!room) {
      const newRoom = await this.room.create({
        data: {
          id: roomId,
          name: 'Direct Chat',
          isDirectChat: true,
          roomMembers: {
            createMany: {
              data: [
                {
                  memberId: userUid,
                },
                {
                  memberId: targetUserUid,
                },
              ],
            },
          },
        },
      });

      const roomMembers = await this.getRoomMember(newRoom.id);
      return {
        ...newRoom,
        messages: [],
        members: roomMembers,
      };
    }

    const roomMessages = await this.getRoomMessage(room.id);
    const roomMembers = await this.getRoomMember(room.id);

    return {
      ...room,
      messages: roomMessages,
      members: roomMembers,
    };
  }
}
