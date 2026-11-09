import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { User } from '../entities/index.js';
import type { UpdateProfileDto } from './profile.schemas.js';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async get(userId: number): Promise<User> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User profile not found');
    }
    return user;
  }

  async update(userId: number, dto: UpdateProfileDto): Promise<User> {
    await this.users.update({ id: userId }, dto);
    return this.get(userId);
  }
}
