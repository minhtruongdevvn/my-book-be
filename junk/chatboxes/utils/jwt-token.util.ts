import { JwtService } from '@nestjs/jwt';

const jwtService: JwtService = new JwtService();
export async function verifyToken(
  secret: string,
  accessToken: any | undefined | null,
): Promise<number | undefined> {
  const token = getJwtToken(accessToken);
  if (!token) return undefined;

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

export function getIdByToken(accessToken: string | any): number | undefined {
  const token = getJwtToken(accessToken);
  if (!token) return undefined;

  const claim = jwtService.decode(token);
  if (!claim) return undefined; // add log

  const id = claim['id'];
  if (!id) return undefined; // add log

  return id;
}

const getJwtToken = (accessToken: undefined | null | any) => {
  if (!accessToken || typeof accessToken !== 'string') return undefined;

  if (accessToken.substring(0, 6).toLowerCase() === 'bearer') {
    return accessToken.substring(6, accessToken.length);
  } else {
    return accessToken;
  }
};
