import { Message, Room, User } from '@prisma/client';

export type GetRoomDetailResult = Room & { roomMessages: Message[]; roomMembers: User[] };
export enum EVENT_TYPE {
  SEND_MESSAGE = 'sendMessage',
  NEW_MESSAGE = 'newMessage',
}
