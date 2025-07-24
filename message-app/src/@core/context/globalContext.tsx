// ** React Imports
import { createContext, ReactNode, useEffect, useState } from 'react'
import { GlobalData, GlobalDataContextValue, RoomData } from 'src/@core/utils/type'
import { postAxios } from 'src/fetcher'
import { GET_USER_CHAT_ROOMS_END_POINT } from 'src/utils/const'

const initialGlobalData: GlobalData = {
  rooms: []
}

// ** Create Context
export const GlobalContext = createContext<GlobalDataContextValue>({
  setGlobalData: () => null,
  globalData: initialGlobalData
})

export const GlobalDataProvider = ({ children }: { children: ReactNode }) => {
  // ** State
  const [globalData, setData] = useState<GlobalData>({ ...initialGlobalData })

  const setGlobalData = (updatedSettings: GlobalData) => {
    setData(updatedSettings)
  }

  useEffect(() => {
    const initData = async () => {
      const { success, data } = await postAxios(`${process.env.NEXT_PUBLIC_API_DOMAIN}${GET_USER_CHAT_ROOMS_END_POINT}`)
      if (!success || !data) {
        return
      }

      setData({
        rooms: data as RoomData[]
      })
    }

    initData()
  }, [])

  return <GlobalContext.Provider value={{ setGlobalData, globalData }}>{children}</GlobalContext.Provider>
}
