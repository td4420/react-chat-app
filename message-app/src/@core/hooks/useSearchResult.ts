import { Room, User } from '@prisma/client'
import { useState } from 'react'
import { getAxios } from 'src/fetcher'
import { GET_DIRECT_CHAT_END_POINT, SEARCH_CONVERSATION_END_POINT } from 'src/utils/const'
import { SearchResult, SearchResultData } from 'src/utils/type'
import { RoomData } from 'src/@core/utils/type'

const useSearchResult = () => {
  const [searchResult, setSearchResult] = useState<SearchResultData>()

  const handleSearch = async (searchKey: string) => {
    const { success, data } = await getAxios(
      `${process.env.NEXT_PUBLIC_API_DOMAIN}${SEARCH_CONVERSATION_END_POINT}/${encodeURIComponent(searchKey)}`
    )

    if (!success) {
      return
    }

    const { rooms, users } = data as { rooms: Room[]; users: User[] }
    const searchRoomResult: SearchResult[] = rooms.map(room => {
      return {
        id: room.id,
        name: room.name,
        avatar: room.avatar,
        status: 'available'
      }
    })

    const searchUserResult: SearchResult[] = users.map(user => {
      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        status: 'available'
      }
    })

    setSearchResult({
      groups: [...searchRoomResult],
      directs: [...searchUserResult]
    })
  }

  const handleClickSearchResult = async (uuid: string): Promise<RoomData | null> => {
    const { success, data } = await getAxios(
      `${process.env.NEXT_PUBLIC_API_DOMAIN}${GET_DIRECT_CHAT_END_POINT}/${uuid}`
    )

    if (!success) {
      return null
    }

    return data as RoomData
  }

  return {
    handleSearch,
    searchResult,
    handleClickSearchResult
  }
}

export default useSearchResult
