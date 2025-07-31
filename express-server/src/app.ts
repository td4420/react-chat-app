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
import { WebsocketService } from '@services/websocket.service';

export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public roomService: RoomService;
  public websocketService: WebsocketService;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    this.websocketService = new WebsocketService();

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
    this.createWebsocketServer();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public async createWebsocketServer() {
    this.websocketService.initWebsocket();
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
