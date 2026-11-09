export const AUTH_COOKIE = 'pushpace_token';

export interface JwtPayload {
  sub: number;
  username: string;
}
