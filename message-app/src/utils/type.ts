import { MessageModel } from '@chatscope/chat-ui-kit-react/src/components/Message/Message'
import { UserStatus } from '@chatscope/chat-ui-kit-react/src/types/unions'
import { Message, Room, User } from '@prisma/client'

export type GetRoomDataResult = Room & {
  roomMessages: Message[]
  roomMembers: User[]
}

export type CheckUserExistedResult = {
  isExisted: boolean
}

export type Conversations = {
  id: string
  info: string
  lastSenderName: string
  name: string
  avatar?: string
  status: UserStatus
}

export type ConversationMessage = MessageModel & {
  senderAvatar: string
}
