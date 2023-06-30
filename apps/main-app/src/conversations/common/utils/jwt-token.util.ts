import { JwtService } from '@nestjs/jwt';

const jwtService: JwtService = new JwtService();

export async function verifyJWToken(
  secret: string,
  accessToken: any | undefined | null,
): Promise<number | undefined> {
  const token = getJWToken(accessToken);
  if (!token) return;

  try {
    const claim = await jwtService.verifyAsync<{ id: number }>(token, {
      secret,
      ignoreExpiration: false,
    });
    return claim.id;
  } catch {
    return;
  }
}

export function getIdByJWToken(accessToken: string | any): number | undefined {
  const token = getJWToken(accessToken);
  if (!token) return;

  const claim = jwtService.decode(token);
  if (!claim) return; // add log

  const id = claim['id'];
  if (!id) return; // add log

  return id;
}

function getJWToken(accessToken: undefined | null | any) {
  if (!accessToken || typeof accessToken !== 'string') return;

  if (accessToken.substring(0, 6).toLowerCase() === 'bearer') {
    return accessToken.substring(6, accessToken.length);
  } else {
    return accessToken;
  }
}
