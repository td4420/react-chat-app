import { MainContainer } from '@chatscope/chat-ui-kit-react'
import { ChatMessageContainer, LeftSideBar, RightSideBar } from './MessageDashboard/index'

const MessageDashboard = () => {
  return (
    <MainContainer
      responsive
      style={{
        height: '100vh'
      }}
    >
      <LeftSideBar />
      <ChatMessageContainer />
      <RightSideBar />
    </MainContainer>
  )
}

export default MessageDashboard
