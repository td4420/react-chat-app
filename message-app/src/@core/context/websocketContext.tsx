// ** React Imports
import { createContext, ReactNode, useEffect, useState } from 'react'
import { useGlobalData } from '../hooks/useGlobalData'
import { EVENT_TYPE, NewMessageData, RoomData } from 'src/@core/utils/type'

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

  useEffect(() => {
    if (!newMessageEvent) {
      return
    }

    const {
      data: { chatRoom, newMessage, members }
    } = newMessageEvent

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
            messages: [newMessage],
            members,
            isDirectChat: chatRoom.isDirectChat
          }
        ]
      })
    } else {
      const newRoomArray: RoomData[] = [...globalData.rooms]
      newRoomArray[chatRoomIndex].messages.push({
        ...newMessage
      })

      setGlobalData({
        ...globalData,
        rooms: newRoomArray
      })
    }

    setNewMessageEvent(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalData, newMessageEvent])

  return <WebsocketContext.Provider value={{ websocketData }}>{children}</WebsocketContext.Provider>
}
