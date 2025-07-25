import { Avatar, Conversation, ConversationList, Search, Sidebar } from '@chatscope/chat-ui-kit-react'
import { useMemo } from 'react'
import { useGlobalData } from 'src/@core/hooks/useGlobalData'
import { getMessageFromHashContent } from 'src/utils/function'
import { Conversations } from 'src/utils/type'

const LeftSideBar = () => {
  const {
    globalData: { rooms },
    updateCurrentRoomId
  } = useGlobalData()

  const conversations: Conversations[] = useMemo(() => {
    return rooms.map(room => {
      const lastMessage = room.messages.length > 0 ? room.messages[0] : null
      const lastSender = lastMessage ? room.members.find(member => member.id === lastMessage.senderId) : null

      return {
        id: room.id,
        info: lastMessage ? getMessageFromHashContent(lastMessage.hashContent) : '',
        lastSenderName: lastSender ? lastSender.name : '',
        name: room.name,
        avatar: room.avatar,
        status: 'available'
      }
    })
  }, [rooms])

  return (
    <Sidebar position='left'>
      <Search placeholder='Search...' />
      <ConversationList>
        {conversations.map(conversation => {
          const { info, lastSenderName, name, avatar, status } = conversation

          return (
            <Conversation
              key={conversation.id}
              info={info}
              lastSenderName={lastSenderName}
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
    </Sidebar>
  )
}

export default LeftSideBar
