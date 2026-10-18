import { SignJWT, jwtVerify } from 'jose';

export const AUTH_COOKIE_NAME = 'auth_token';

const JWT_SECRET = process.env.JWT_SECRET || 'greennusa-secret-key';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface TokenPayload {
  sub: string;
  username: string;
  email: string;
  name?: string;
  role?: string;
}

export async function signAuthToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);
}

export async function verifyAuthToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getAuthSessionFromRequest(request: {
  cookies: { get: (name: string) => { value: string } | undefined };
}): Promise<TokenPayload | null> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}
