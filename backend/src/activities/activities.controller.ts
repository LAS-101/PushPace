import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CurrentUserId } from '../auth/auth.guard.js';
import {
  activityIdSchema,
  type ActivityType,
  activityTypeSchema,
  CREATE_SCHEMAS,
} from './activities.schemas.js';
import { ActivitiesService } from './activities.service.js';

@Controller('activities')
@UseGuards(AuthGuard)
export class ActivitiesController {
  constructor(private readonly activities: ActivitiesService) {}

  @Get(':type')
  list(
    @CurrentUserId() userId: number,
    @Param('type', { schema: activityTypeSchema }) type: ActivityType,
  ) {
    return this.activities.list(type, userId);
  }

  @Post(':type')
  async create(
    @CurrentUserId() userId: number,
    @Param('type', { schema: activityTypeSchema }) type: ActivityType,
    @Body() body: unknown,
  ) {
    // The body shape depends on the route param, so it is validated here.
    const parsed = await CREATE_SCHEMAS[type].safeParseAsync(body);
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues.map((issue) =>
          issue.path.length
            ? `${issue.path.join('.')}: ${issue.message}`
            : issue.message,
        ),
      );
    }
    return this.activities.create(type, userId, parsed.data);
  }

  @Delete(':type/:id')
  remove(
    @CurrentUserId() userId: number,
    @Param('type', { schema: activityTypeSchema }) type: ActivityType,
    @Param('id', { schema: activityIdSchema }) id: number,
  ) {
    return this.activities.remove(type, userId, id);
  }
}
