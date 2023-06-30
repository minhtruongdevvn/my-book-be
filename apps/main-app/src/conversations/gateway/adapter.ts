import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { IncomingMessage } from 'http';
import { Server, ServerOptions } from 'socket.io';
import { verifyJWToken } from '@/conversations/common/utils';

export class ChatboxSocketIOAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const clientPort =
      this.configService.getOrThrow<string>('app.frontendDomain');
    const cors = {
      origin: [clientPort],
    };
    const chatboxOption: Partial<ServerOptions> = {
      ...(options ?? {}),
      cors,
      allowRequest: (req, fn) => validateRequest(req, this.configService, fn),
    };

    const server: Server = super.createIOServer(port, chatboxOption);
    return server;
  }
}

const validateRequest = async (
  request: IncomingMessage,
  configService: ConfigService,
  allowFunction: (err: string | null | undefined, success: boolean) => void,
) => {
  const user = await verifyJWToken(
    configService.getOrThrow<string>('auth.secret'),
    request.headers.authorization,
  );

  if (!user) return allowFunction('Unauthorized', false);
  return allowFunction(undefined, true);
};
