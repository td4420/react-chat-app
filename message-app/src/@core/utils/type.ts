import { Message, Room, User } from '@prisma/client'

export type RoomData = Room & {
  messages: Message[]
  members: User[]
}

export type GlobalData = {
  rooms: RoomData[]
}

export type GlobalDataContextValue = {
  setGlobalData: (updatedData: GlobalData) => void
  globalData: GlobalData
}

export enum EVENT_TYPE {
  SEND_MESSAGE = 'sendMessage',
  NEW_MESSAGE = 'newMessage'
}

export type NewMessageData = {
  eventType: EVENT_TYPE
  data: {
    newMessage: Message
    chatRoom: Room
    members: User[]
  }
}
