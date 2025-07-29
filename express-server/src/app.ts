import 'reflect-metadata';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import { Routes } from '@interfaces/routes.interface';
import { ErrorMiddleware } from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import WebSocket, { WebSocketServer } from 'ws';
import { EVENT_TYPE, NewMessagePayload } from './utils/type';
import { RoomService } from '@services/rooms.service';

export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public roomService: RoomService;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    this.roomService = new RoomService();

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
    this.createWebsocketServer(this.roomService);
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public createWebsocketServer(roomService: RoomService) {
    const wss = new WebSocketServer({
      port: 8080,
    });
    wss.on('connection', function connection(ws) {
      ws.on('error', console.error);

      ws.on('message', async function message(data) {
        console.log('receive message');
        const { eventType, data: eventData } = JSON.parse(data as any);
        if (eventType === EVENT_TYPE.SEND_MESSAGE) {
          const newMessage = await roomService.sendMessage(eventData as NewMessagePayload);
          // Broadcast to all connected clients
          //TODO: Send to room member only
          wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  eventType: EVENT_TYPE.NEW_MESSAGE,
                  data: newMessage,
                }),
              );
            }
          });
        }
      });
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    const hppMiddleware: any = hpp();
    const compressionMiddleWare: any = compression();
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hppMiddleware);
    this.app.use(helmet());
    this.app.use(compressionMiddleWare);
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', (swaggerUi as any).serve, (swaggerUi as any).setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
  }
}
