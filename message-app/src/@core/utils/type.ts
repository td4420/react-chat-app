import { Message, Room, User } from '@prisma/client'

export type RoomData = Room & {
  messages: (Message & {
    decryptedContent?: string
    messageKey: {
      encryptedKey: string
      recipientId: string
    }[]
  })[]
  members: User[]
}

export type GlobalData = {
  rooms: RoomData[]
}

export type GlobalDataContextValue = {
  setGlobalData: (updatedData: GlobalData) => void
  globalData: GlobalData
  updateCurrentRoomId: (roomId: string) => void
  currentRoom: RoomData | null
}

export enum EVENT_TYPE {
  SEND_MESSAGE = 'sendMessage',
  NEW_MESSAGE = 'newMessage'
}

export type NewMessageData = {
  eventType: EVENT_TYPE
  data: {
    newMessage: Message & {
      decryptedContent?: string
      messageKey: {
        encryptedKey: string
        recipientId: string
      }[]
    }
    chatRoom: Room
    members: User[]
  }
}
