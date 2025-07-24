import { useContext } from 'react'
import { WebsocketContext, WebsocketContextValue } from '../context/websocketContext'

export const useWebsocket = (): WebsocketContextValue => useContext(WebsocketContext)
