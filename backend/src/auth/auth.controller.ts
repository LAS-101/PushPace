import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import { AUTH_COOKIE } from './auth.constants.js';
import {
  type LoginDto,
  loginSchema,
  type RegisterDto,
  registerSchema,
} from './auth.schemas.js';
import { AuthService, type PublicUser } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body({ schema: registerSchema }) dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.register(dto);
    await this.setAuthCookie(res, user);
    return { message: 'User registered and logged in successfully', user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body({ schema: loginSchema }) dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.login(dto);
    await this.setAuthCookie(res, user);
    return { message: 'Login successful', user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    const { maxAge: _maxAge, ...options } = this.cookieOptions();
    res.clearCookie(AUTH_COOKIE, options);
    return { message: 'Logged out successfully' };
  }

  /** Reports whether the caller is logged in (never responds 401). */
  @Get('me')
  async me(@Req() req: Request) {
    const token = req.cookies?.[AUTH_COOKIE] as string | undefined;
    const payload = token ? await this.auth.verifyToken(token) : null;
    const user = payload ? await this.auth.findPublicUser(payload.sub) : null;
    return user ? { authenticated: true, user } : { authenticated: false };
  }

  private async setAuthCookie(res: Response, user: PublicUser) {
    res.cookie(
      AUTH_COOKIE,
      await this.auth.signToken(user),
      this.cookieOptions(),
    );
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get('NODE_ENV') === 'production',
      path: '/',
      maxAge: this.config.getOrThrow<number>('SESSION_TTL_HOURS') * 3600_000,
    };
  }
}
