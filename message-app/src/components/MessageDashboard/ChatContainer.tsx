import {
  Avatar,
  ChatContainer,
  ConversationHeader,
  InfoButton,
  Message,
  MessageInput,
  MessageList,
  MessageSeparator,
  TypingIndicator,
  VideoCallButton,
  VoiceCallButton
} from '@chatscope/chat-ui-kit-react'
import { useCallback, useMemo } from 'react'
import { useGlobalData } from 'src/@core/hooks/useGlobalData'
import { useWebsocket } from 'src/@core/hooks/useWebsocket'
import auth from 'src/configs/firebase'
import { b64, getCryptoKeyFromBase64, strToUint8 } from 'src/utils/function'
import { ConversationMessage } from 'src/utils/type'

const ChatMessageContainer = () => {
  const { currentRoom } = useGlobalData()
  const {
    websocketData: { websocket }
  } = useWebsocket()

  const currentUser = auth.currentUser
  const renderMessageSeparator = (content: string) => {
    const props: any = { content } //Workaround for type error component

    return <MessageSeparator {...props} />
  }

  const messages: ConversationMessage[] = useMemo(() => {
    if (!currentRoom || !currentUser || !currentRoom.messages.length) {
      return []
    }

    return currentRoom.messages
      .map(message => {
        const sender = currentRoom.members.find(member => member.id === message.senderId)
        const isSender = currentUser.uid === message.senderId

        return {
          direction: !isSender ? 'incoming' : 'outgoing',
          message: message?.decryptedContent ?? '',
          position: 'single',
          sender: sender?.name || '',
          sentTime: new Date(message.createdAt).toISOString(),
          senderAvatar: sender?.avatar || ''
        } as ConversationMessage
      })
      .filter(item => !!item.message)
  }, [currentRoom, currentUser])

  const renderMessages = useCallback(() => {
    return messages.map((message, index) => {
      return (
        <Message
          key={index}
          model={{
            direction: message.direction,
            message: message.message,
            position: message.position,
            sender: message.sender,
            sentTime: message.sentTime
          }}
        >
          <Avatar name={message.sender} src={message.senderAvatar} />
        </Message>
      )
    })
  }, [messages])

  const name = useMemo(() => {
    if (!currentRoom || !currentUser) {
      return ''
    }

    const isDirectChat = currentRoom.isDirectChat

    return isDirectChat
      ? currentRoom.members.find(member => member.id !== currentUser.uid)?.name || ''
      : currentRoom.name
  }, [currentRoom, currentUser])

  const avatar = useMemo(() => {
    if (!currentRoom || !currentUser) {
      return ''
    }

    const isDirectChat = currentRoom.isDirectChat

    return isDirectChat
      ? currentRoom.members.find(member => member.id !== currentUser.uid)?.avatar || ''
      : currentRoom.avatar
  }, [currentRoom, currentUser])

  const sendMessage = useCallback(
    async (innerHtml: string, textContent: string, innerText: string, nodes: NodeList) => {
      if (!innerHtml || !textContent || !innerText || !nodes) {
        return
      }

      if (!websocket || !currentUser || !currentRoom || !innerHtml) {
        return
      }

      const accessToken = await currentUser.getIdToken()

      const aesKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
      const iv = crypto.getRandomValues(new Uint8Array(12))

      const encryptedMessage = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, strToUint8(textContent))

      const newMessage = {
        createdAt: new Date(),
        iv: b64(iv),
        encryptedPayload: b64(encryptedMessage),
        roomId: currentRoom.id,
        accessToken
      }

      const exportedAesKey = await crypto.subtle.exportKey('raw', aesKey)
      const messageKeys: {
        recipientId: string
        encryptedKey: string
      }[] = []

      await Promise.all(
        currentRoom.members.map(async member => {
          const memberPublicKey = await getCryptoKeyFromBase64(member.publicKey)
          const encryptedSymKey = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, memberPublicKey, exportedAesKey)

          messageKeys.push({
            recipientId: member.id,
            encryptedKey: b64(encryptedSymKey) // Base64 to store in DB
          })
        })
      )

      websocket.send(
        JSON.stringify({
          eventType: 'sendMessage',
          data: {
            ...newMessage,
            messageKeys
          }
        })
      )
    },
    [websocket, currentUser, currentRoom]
  )

  return !currentRoom ? (
    <></>
  ) : (
    <ChatContainer>
      <ConversationHeader>
        <ConversationHeader.Back />
        <Avatar name={name} src={avatar} />
        <ConversationHeader.Content info='Active 10 mins ago' userName={name} />
        <ConversationHeader.Actions>
          <VoiceCallButton />
          <VideoCallButton />
          <InfoButton />
        </ConversationHeader.Actions>
      </ConversationHeader>
      <MessageList typingIndicator={<TypingIndicator content='Zoe is typing' />}>
        {renderMessageSeparator('Saturday, 30 November 2019')}
        {renderMessages()}
      </MessageList>
      <MessageInput placeholder='Type message here' onSend={sendMessage} />
    </ChatContainer>
  )
}

export default ChatMessageContainer
