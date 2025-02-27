import { jwtVerify } from 'jose';

export async function verifyAuth(token: string) {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    return verified.payload;
  } catch (err) {
    throw new Error('Invalid token');
  }
}

export function getTokenFromHeader(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authentication header');
  }
  return authHeader.split(' ')[1];
}