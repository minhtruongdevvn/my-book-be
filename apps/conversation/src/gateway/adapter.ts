import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { IncomingMessage } from 'http';
import { createClient } from 'redis';
import { Server, ServerOptions } from 'socket.io';
import { verifyJWToken } from '../common/utils';

export class ConversationSocketIOAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(
    app: INestApplicationContext,
    private readonly configService: ConfigService,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const port = this.configService.getOrThrow<number>('CHAT_REDIS_PORT');
    const host = this.configService.getOrThrow<string>('CHAT_REDIS_HOST');

    const pubClient = createClient({ url: `redis://${host}:${port}` });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const clientPort = this.configService.getOrThrow<string>('FRONTEND_DOMAIN');
    const cors = { origin: [clientPort] };
    const chatboxOption: Partial<ServerOptions> = {
      ...(options ?? {}),
      allowRequest: (req, fn) => validateRequest(req, this.configService, fn),
      cors,
    };

    const server: Server = super.createIOServer(port, chatboxOption);
    server.adapter(this.adapterConstructor);
    return server;
  }
}

const validateRequest = async (
  request: IncomingMessage,
  configService: ConfigService,
  allowFunction: (err: string | null | undefined, success: boolean) => void,
) => {
  const user = await verifyJWToken(
    configService.getOrThrow<string>('AUTH_JWT_SECRET'),
    request.headers.authorization,
  );

  if (!user) return allowFunction('Unauthorized', false);
  return allowFunction(undefined, true);
};
