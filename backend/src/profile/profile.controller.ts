import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUserId } from '../auth/auth.guard.js';
import {
  type UpdateProfileDto,
  updateProfileSchema,
} from './profile.schemas.js';
import { ProfileService } from './profile.service.js';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  get(@CurrentUserId() userId: number) {
    return this.profile.get(userId);
  }

  @Put()
  async update(
    @CurrentUserId() userId: number,
    @Body({ schema: updateProfileSchema }) dto: UpdateProfileDto,
  ) {
    const profile = await this.profile.update(userId, dto);
    return { message: 'Profile updated successfully', profile };
  }
}
