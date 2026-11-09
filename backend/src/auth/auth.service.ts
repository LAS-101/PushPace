import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import type { Repository } from 'typeorm';
import { User } from '../entities/index.js';
import type { JwtPayload } from './auth.constants.js';
import type { LoginDto, RegisterDto } from './auth.schemas.js';

const BCRYPT_COST = 12;

export interface PublicUser {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<PublicUser> {
    const existing = await this.users.findOne({
      where: [{ username: dto.username }, { email: dto.email }],
    });
    if (existing) {
      throw new BadRequestException('Username or email already exists');
    }

    const user = await this.users.save(
      this.users.create({
        username: dto.username,
        email: dto.email,
        passwordHash: await bcrypt.hash(dto.password, BCRYPT_COST),
      }),
    );
    return this.toPublic(user);
  }

  async login(dto: LoginDto): Promise<PublicUser> {
    const user = await this.users.findOne({
      where: { username: dto.username },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    // bcryptjs also verifies `$2y$` hashes produced by the old PHP backend.
    const valid =
      !!user?.passwordHash &&
      (await bcrypt.compare(dto.password, user.passwordHash));
    if (!user || !valid) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return this.toPublic(user);
  }

  async findPublicUser(id: number): Promise<PublicUser | null> {
    const user = await this.users.findOne({ where: { id } });
    return user ? this.toPublic(user) : null;
  }

  signToken(user: PublicUser): Promise<string> {
    const payload: JwtPayload = { sub: user.id, username: user.username };
    return this.jwt.signAsync(payload);
  }

  async verifyToken(token: string): Promise<JwtPayload | null> {
    try {
      return await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  private toPublic(user: User): PublicUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
