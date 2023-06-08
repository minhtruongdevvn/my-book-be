import { JwtService } from '@nestjs/jwt';
import { ChatboxSocket } from '../gateway/types';

export async function verifyToken(
  secret: string,
  accessToken: any | undefined | null,
): Promise<number | undefined> {
  const token = getJwtToken(accessToken);
  if (!token) return undefined;

  const jwtService: JwtService = new JwtService();
  try {
    const claim = await jwtService.verifyAsync<{ id: number }>(token, {
      secret,
      ignoreExpiration: false,
    });
    return claim.id;
  } catch {
    return undefined;
  }
}

export function saveUserForSocket(socket: ChatboxSocket) {
  const token = getJwtToken(socket.handshake.headers.authorization);
  if (!token) return;

  const jwtService: JwtService = new JwtService();

  const claim = jwtService.decode(token);
  if (!claim) return; // add log

  const id = claim['id'];
  if (!id) return; // add log

  socket.conn.userId = id;
}

const getJwtToken = (accessToken: undefined | null | any) => {
  if (!accessToken || typeof accessToken !== 'string') return undefined;
  const tokenData = accessToken.split(' ');

  if (tokenData.length == 2) {
    if (tokenData[0].toLowerCase() !== 'bearer') return undefined;

    return tokenData[1];
  } else {
    return accessToken;
  }
};
