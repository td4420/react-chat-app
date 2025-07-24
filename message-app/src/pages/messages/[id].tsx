// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Styled Component Import
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

import type { GetServerSideProps } from 'next/types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Title from 'src/components/Title'
import auth from 'src/configs/firebase'

// RCE CSS
import 'react-chat-elements/dist/main.css'

// MessageBox component
import { Button, Input, MessageList, MessageType } from 'react-chat-elements'
import { useGlobalData } from 'src/@core/hooks/useGlobalData'
import { useWebsocket } from 'src/@core/hooks/useWebsocket'
import { RoomData } from 'src/@core/utils/type'

type Props = {
  roomId: string
}
export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const roomId = context.query.id as string

  return {
    props: {
      roomId
    }
  }
}

const MessageDetail = ({ roomId }: Props) => {
  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [inputMessage, setInputMessage] = useState<string>('')

  const currentUser = auth.currentUser
  const {
    websocketData: { websocket }
  } = useWebsocket()

  const { globalData } = useGlobalData()

  const inputRef = useRef()
  const messageListRef = useRef()

  useEffect(() => {
    const matchChatRoom = (globalData.rooms || []).find(room => room.id === roomId)

    if (!matchChatRoom) {
      console.log('Not match')

      return
    }

    setRoomData({
      ...matchChatRoom
    })
  }, [globalData, roomId])

  const messageListDataSource: MessageType[] = useMemo(() => {
    if (!roomData || !currentUser) {
      return []
    }

    const { messages, members } = roomData

    return messages.map(message => {
      const isSender = currentUser.uid === message.senderId
      const sender = members.find(member => member.id === message.senderId)

      return {
        id: message.id,
        position: isSender ? 'right' : 'left',
        text: message.hashContent,
        title: sender?.name || 'User',
        focus: false,
        date: new Date(message.createdAt),
        titleColor: 'red',
        forwarded: false,
        replyButton: true,
        removeButton: true,
        status: isSender ? 'sent' : 'received',
        notch: false,
        retracted: false,
        type: 'text'
      }
    })
  }, [roomData, currentUser])

  const sendMessage = useCallback(async () => {
    if (!websocket || !currentUser) {
      return
    }

    const accessToken = await currentUser.getIdToken()

    const newMessage = {
      createdAt: new Date(),
      hashContent: inputMessage,
      roomId,
      accessToken
    }

    websocket.send(
      JSON.stringify({
        eventType: 'sendMessage',
        data: {
          ...newMessage
        }
      })
    )
    setInputMessage('')
    if (inputRef.current) {
      ;(inputRef.current as any).value = ''
    }
  }, [websocket, inputMessage, currentUser, roomId, inputRef])

  return !roomData ? (
    <></>
  ) : (
    <ApexChartWrapper>
      <Title title={`${roomData.name}`} />
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <MessageList
            referance={messageListRef}
            className='message-list'
            lockable={true}
            toBottomHeight={'100%'}
            dataSource={messageListDataSource}
          />
          <Input
            referance={inputRef}
            placeholder='Type here...'
            multiline={true}
            onChange={(event: any) => setInputMessage(event.target.value)}
            value={inputMessage}
            maxHeight={50}
            rightButtons={<Button color='white' backgroundColor='black' text='Send' onClick={sendMessage} />}
          />
        </Grid>
      </Grid>
    </ApexChartWrapper>
  )
}

export default MessageDetail
