import { Message, MessageKey, Room, User } from '@prisma/client';

export type GetRoomDetailResult = Room & { roomMessages: Message[]; roomMembers: User[] };
export type SearchResult = {
  rooms: Room[];
  users: User[];
};
export enum EVENT_TYPE {
  SEND_MESSAGE = 'sendMessage',
  NEW_MESSAGE = 'newMessage',
}

export type MessageKeyPayload = {
  recipientId: string;
  encryptedKey: string;
};

export type NewMessagePayload = {
  accessToken: string;
  roomId: string;
  createdAt: Date;
  encryptedPayload: string;
  messageKeys: MessageKeyPayload[];
  iv: string;
};

export type SendMessageResult = {
  newMessage: Message & { messageKey: MessageKey[] };
  roomMessages: Message[];
  chatRoom: Room;
  members: User[];
};
