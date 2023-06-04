import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import * as dotenv from 'dotenv';
import { Server } from 'socket.io';
import { USER_CONNECTED, USER_DISCONNECTED } from './chatbox-event';
dotenv.config();

@WebSocketGateway({
  namespace: 'chatbox',
  cors: { origin: process.env.FRONTEND_DOMAIN },
})
export class ChatboxGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  userCount = 0;

  handleConnection() {
    this.userCount++;
    this.server.emit(USER_CONNECTED, this.userCount);
  }

  handleDisconnect() {
    this.userCount--;
    this.server.emit(USER_DISCONNECTED, this.userCount);
  }
}
