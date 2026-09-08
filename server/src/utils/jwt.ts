import jwt from 'jsonwebtoken';

interface AuthTokenPayload {
  sub: string;
  email: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET must be set in the environment');
  return secret;
}

export function signAuthToken(userId: string, email: string): string {
  return jwt.sign({ sub: userId, email }, getSecret(), { expiresIn: '7d' });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, getSecret()) as AuthTokenPayload;
}
