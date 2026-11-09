import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AUTH_COOKIE, type JwtPayload } from './auth.constants.js';

export interface AuthenticatedRequest extends Request {
  userId: number;
}

/** Rejects requests that do not carry a valid auth cookie. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies?.[AUTH_COOKIE] as string | undefined;
    if (!token) {
      throw new UnauthorizedException('User not authenticated');
    }
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      request.userId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Session expired, please log in again');
    }
  }
}

/** Injects the id of the logged-in user (requires `AuthGuard`). */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().userId,
);
