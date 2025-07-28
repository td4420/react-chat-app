import { Avatar, Conversation, ConversationList, MessageSeparator, Search, Sidebar } from '@chatscope/chat-ui-kit-react'
import { useEffect, useMemo, useState } from 'react'
import { useGlobalData } from 'src/@core/hooks/useGlobalData'
import useSearchResult from 'src/@core/hooks/useSearchResult'
import auth from 'src/configs/firebase'
import { getMessageFromHashContent } from 'src/utils/function'
import { Conversations } from 'src/utils/type'

const LeftSideBar = () => {
  const { globalData, setGlobalData, updateCurrentRoomId } = useGlobalData()

  const { handleSearch, searchResult, handleClickSearchResult } = useSearchResult()

  const [searchValue, setSearchValue] = useState<string>('')

  const currentUser = auth.currentUser

  const renderMessageSeparator = (content: string) => {
    const props: any = { content } //Workaround for type error component

    return <MessageSeparator {...props} />
  }

  useEffect(() => {
    if (!searchValue) {
      return
    }

    handleSearch(searchValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  const conversations: Conversations[] = useMemo(() => {
    if (!currentUser) {
      return []
    }

    return globalData.rooms.map(room => {
      const lastMessage = room.messages.length > 0 ? room.messages[0] : null
      const lastSender = lastMessage ? room.members.find(member => member.id === lastMessage.senderId) : null

      return {
        id: room.id,
        info: lastMessage ? getMessageFromHashContent(lastMessage.hashContent) : '',
        lastSenderName: lastSender ? lastSender.name : '',
        name: !room.isDirectChat ? room.name : room.members.find(member => member.id != currentUser.uid)?.name || '',
        avatar: !room.isDirectChat
          ? room.avatar
          : room.members.find(member => member.id != currentUser.uid)?.avatar || '',
        status: 'available'
      }
    })
  }, [globalData, currentUser])

  return (
    <Sidebar position='left'>
      <Search
        placeholder='Search...'
        value={searchValue}
        onChange={value => setSearchValue(value)}
        onClearClick={() => setSearchValue('')}
      />
      {searchValue ? (
        <ConversationList>
          {(searchResult?.groups || []).length > 0 && renderMessageSeparator('Groups')}
          {(searchResult?.groups || []).map(conversation => {
            const { name, avatar, status } = conversation

            return (
              <Conversation
                key={conversation.id}
                name={name}
                onClick={() => {
                  updateCurrentRoomId(conversation.id)
                }}
              >
                <Avatar
                  name={name}
                  src={avatar || 'https://chatscope.io/storybook/react/assets/lilly-aj6lnGPk.svg'}
                  status={status}
                />
              </Conversation>
            )
          })}
          {(searchResult?.directs || []).length > 0 && renderMessageSeparator('Users')}
          {(searchResult?.directs || []).map(conversation => {
            const { name, avatar, status } = conversation

            return (
              <Conversation
                key={conversation.id}
                name={name}
                onClick={async () => {
                  const roomData = await handleClickSearchResult(conversation.id)
                  if (roomData?.id) {
                    const isExisted = globalData.rooms.find(room => room.id === roomData.id)
                    if (!isExisted) {
                      setGlobalData({
                        ...globalData,
                        rooms: [...globalData.rooms, roomData]
                      })
                    }
                    updateCurrentRoomId(roomData.id)
                  }
                }}
              >
                <Avatar
                  name={name}
                  src={avatar || 'https://chatscope.io/storybook/react/assets/lilly-aj6lnGPk.svg'}
                  status={status}
                />
              </Conversation>
            )
          })}
        </ConversationList>
      ) : (
        <ConversationList>
          {conversations.map(conversation => {
            const { info, lastSenderName, name, avatar, status } = conversation

            return (
              <Conversation
                key={conversation.id}
                info={info || undefined}
                lastSenderName={lastSenderName || undefined}
                name={name}
                onClick={() => {
                  updateCurrentRoomId(conversation.id)
                }}
              >
                <Avatar
                  name={name}
                  src={avatar || 'https://chatscope.io/storybook/react/assets/lilly-aj6lnGPk.svg'}
                  status={status}
                />
              </Conversation>
            )
          })}
        </ConversationList>
      )}
    </Sidebar>
  )
}

export default LeftSideBar
