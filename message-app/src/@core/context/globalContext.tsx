// ** React Imports
import { createContext, ReactNode, useEffect, useMemo, useState } from 'react'
import { GlobalData, GlobalDataContextValue, RoomData } from 'src/@core/utils/type'
import auth from 'src/configs/firebase'
import { postAxios } from 'src/fetcher'
import { GET_USER_CHAT_ROOMS_END_POINT } from 'src/utils/const'
import { getMessageFromHashContent } from 'src/utils/function'

const initialGlobalData: GlobalData = {
  rooms: []
}

// ** Create Context
export const GlobalContext = createContext<GlobalDataContextValue>({
  setGlobalData: () => null,
  globalData: initialGlobalData,
  updateCurrentRoomId: () => null,
  currentRoom: null,
  refetchData: () => null
})

export const GlobalDataProvider = ({ children }: { children: ReactNode }) => {
  // ** State
  const [globalData, setData] = useState<GlobalData>({ ...initialGlobalData })
  const [currentRoomId, setCurrentRoomId] = useState<string>('')
  const [shouldRefetch, setShouldRefetch] = useState<boolean>(false)
  const currentUser = auth.currentUser

  const setGlobalData = (updatedSettings: GlobalData) => {
    setData(updatedSettings)
  }

  const updateCurrentRoomId = (roomId: string) => {
    setCurrentRoomId(roomId)
  }

  const refetchData = () => {
    setShouldRefetch(true)
  }

  const initData = async () => {
    if (!currentUser) {
      return
    }

    const { success, data } = await postAxios(`${process.env.NEXT_PUBLIC_API_DOMAIN}${GET_USER_CHAT_ROOMS_END_POINT}`)
    if (!success || !data) {
      return
    }

    const rooms = data as RoomData[]
    const decryptedRooms: RoomData[] = await Promise.all(
      rooms.map(async room => {
        return {
          ...room,
          messages: await Promise.all(
            room.messages.map(async message => {
              const messageKey = message.messageKey.find(key => key.recipientId === currentUser.uid)

              return {
                ...message,
                decryptedContent: messageKey
                  ? await getMessageFromHashContent(messageKey.encryptedKey, message.encryptedPayload, message.iv)
                  : ''
              }
            })
          )
        }
      })
    )

    setData({ rooms: decryptedRooms })
  }

  useEffect(() => {
    if (!currentUser) {
      return
    }

    initData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser])

  useEffect(() => {
    if (!shouldRefetch) {
      return
    }

    setShouldRefetch(false)
    initData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRefetch])

  const currentRoom: RoomData | null = useMemo(() => {
    const result = globalData.rooms.find(room => room.id === currentRoomId)
    if (!result) {
      return null
    }

    return {
      ...result
    }
  }, [globalData, currentRoomId])

  return (
    <GlobalContext.Provider value={{ setGlobalData, globalData, updateCurrentRoomId, currentRoom, refetchData }}>
      {children}
    </GlobalContext.Provider>
  )
}
