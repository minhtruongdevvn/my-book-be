import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';

export class ChatboxSocketIOAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const clientPort =
      this.configService.getOrThrow<string>('app.frontendDomain');
    const cors = {
      origin: [clientPort],
    };

    const optionsWithCORS: Partial<ServerOptions> = {
      ...(options ?? {}),
      cors,
    };

    //const jwtService = this.app.get(JwtService);
    const server: Server = super.createIOServer(port, optionsWithCORS);

    //server.of('polls').use(createTokenMiddleware(jwtService, this.logger));

    return server;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createTokenMiddleware =
  (jwtService: JwtService, logger: Logger) =>
  (socket /*:SocketWithAuth*/, next) => {
    // for Postman testing support, fallback to token header
    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];

    logger.debug(`Validating auth token before connection: ${token}`);

    try {
      const payload = jwtService.verify(token);
      socket.userID = payload.sub;
      socket.pollID = payload.pollID;
      socket.name = payload.name;
      next();
    } catch {
      next(new Error('FORBIDDEN'));
    }
  };
