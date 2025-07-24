import { Message, Room, User } from "@prisma/client";

export type GetRoomDataResult = Room & {
  roomMessages: Message[]
  roomMembers: User[]
}
