// ** React Imports
import { User } from 'firebase/auth'
import { createContext, ReactNode, useEffect, useState } from 'react'
import { EVENT_TYPE, NewMessageData, RoomData } from 'src/@core/utils/type'
import auth from 'src/configs/firebase'
import { getMessageFromHashContent } from 'src/utils/function'
import { useGlobalData } from '../hooks/useGlobalData'

export type WebsocketData = {
  websocket: WebSocket | null
}

export type WebsocketContextValue = {
  websocketData: WebsocketData
}

const initialWebsocketData: WebsocketData = {
  websocket: null
}

// ** Create Context
export const WebsocketContext = createContext<WebsocketContextValue>({
  websocketData: initialWebsocketData
})

export const WebsocketProvider = ({ children }: { children: ReactNode }) => {
  // ** State
  const [websocketData, setWebsocketData] = useState<WebsocketData>({ ...initialWebsocketData })
  const { globalData, setGlobalData } = useGlobalData()
  const [newMessageEvent, setNewMessageEvent] = useState<NewMessageData | null>(null)
  const currentUser = auth.currentUser

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_WEBSOCKET_DOMAIN) {
      return
    }

    const webSocketConnection = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_DOMAIN)
    webSocketConnection.onmessage = event => {
      const eventData = JSON.parse(event.data)
      const { eventType } = eventData
      if (eventType === EVENT_TYPE.NEW_MESSAGE) {
        setNewMessageEvent(eventData)
      }
    }

    setWebsocketData({ websocket: webSocketConnection })
  }, [])

  const handleNewMessageEvent = async (newMessageEvent: NewMessageData, currentUser: User) => {
    setNewMessageEvent(null)
    if (!newMessageEvent || !currentUser) {
      return
    }

    const {
      data: { chatRoom, newMessage, members }
    } = newMessageEvent

    const messageKey = newMessage.messageKey.find(key => key.recipientId === currentUser.uid)
    const decryptedContent = messageKey
      ? await getMessageFromHashContent(messageKey.encryptedKey, newMessage.encryptedPayload, newMessage.iv)
      : ''

    const newDecryptedMessage = {
      ...newMessage,
      decryptedContent
    }

    const chatRoomIndex = globalData.rooms.findIndex(room => room.id === chatRoom.id)

    // Add new room to global data if it not existed
    if (chatRoomIndex == -1) {
      setGlobalData({
        ...globalData,
        rooms: [
          ...globalData.rooms,
          {
            id: newMessage.roomId,
            name: chatRoom.name,
            avatar: chatRoom.avatar,
            messages: [
              {
                ...newDecryptedMessage
              }
            ],
            members,
            isDirectChat: chatRoom.isDirectChat
          }
        ]
      })
    } else {
      const newRoomArray: RoomData[] = [...globalData.rooms]
      newRoomArray[chatRoomIndex].messages.push({
        ...newDecryptedMessage
      })

      setGlobalData({
        ...globalData,
        rooms: newRoomArray
      })
    }
  }

  useEffect(() => {
    if (!newMessageEvent || !currentUser) {
      return
    }
    handleNewMessageEvent(newMessageEvent, currentUser)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalData, newMessageEvent, currentUser])

  return <WebsocketContext.Provider value={{ websocketData }}>{children}</WebsocketContext.Provider>
}
