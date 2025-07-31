import { AuthPayload, EVENT_TYPE, NewMessagePayload, WebsocketEventPayload } from '@/utils/type';
import { Service } from 'typedi';
import WebSocket, { WebSocketServer } from 'ws';
import { RoomService } from './rooms.service';
import authAdmin from '@/config/firebase';

@Service()
export class WebsocketService {
  public roomService = new RoomService();
  public userSockets: {
    uid: string;
    websocket: WebSocket;
  }[] = [];

  public initWebsocket() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    const wss = new WebSocketServer({
      port: 8080,
    });

    wss.on('connection', function connection(ws) {
      ws.on('error', console.error);

      ws.on('message', async function message(data) {
        const { eventType, data: eventData } = JSON.parse(data as any) as WebsocketEventPayload;
        switch (eventType) {
          case EVENT_TYPE.SEND_MESSAGE:
            await that.handleNewMessage(eventData);
            break;
          case EVENT_TYPE.AUTH:
            await that.handleAuth(ws, eventData);
            break;
        }
      });
    });
  }

  private async handleNewMessage(eventData: NewMessagePayload) {
    console.log(this.userSockets.map(item => item.uid));
    const newMessage = await this.roomService.sendMessage(eventData);
    // Broadcast to all connected clients of chat room
    newMessage.members.map(member => {
      const client = this.userSockets.find(item => item.uid === member.id)?.websocket;
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            eventType: EVENT_TYPE.NEW_MESSAGE,
            data: newMessage,
          }),
        );
      }
    });
  }

  private async handleAuth(ws: WebSocket, eventData: AuthPayload) {
    try {
      const decodedIdToken = await authAdmin.verifyIdToken(eventData.token);
      this.userSockets.push({
        uid: decodedIdToken.uid,
        websocket: ws,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
