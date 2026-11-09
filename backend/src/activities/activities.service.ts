import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import {
  GymWorkout,
  RunningActivity,
  WalkingActivity,
} from '../entities/index.js';
import type {
  ActivityType,
  CreateGymDto,
  CreateRunningDto,
  CreateWalkingDto,
} from './activities.schemas.js';

const LABELS: Record<ActivityType, string> = {
  walking: 'Walking activity',
  running: 'Running activity',
  gym: 'Gym workout',
};

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(WalkingActivity)
    private readonly walking: Repository<WalkingActivity>,
    @InjectRepository(RunningActivity)
    private readonly running: Repository<RunningActivity>,
    @InjectRepository(GymWorkout)
    private readonly gym: Repository<GymWorkout>,
  ) {}

  list(type: ActivityType, userId: number) {
    const order = { date: 'DESC', id: 'DESC' } as const;
    switch (type) {
      case 'walking':
        return this.walking.find({ where: { userId }, order });
      case 'running':
        return this.running.find({ where: { userId }, order });
      case 'gym':
        return this.gym.find({
          where: { userId },
          relations: { exercises: true },
          order: { ...order, exercises: { id: 'ASC' } },
        });
    }
  }

  async create(
    type: ActivityType,
    userId: number,
    dto: CreateWalkingDto | CreateRunningDto | CreateGymDto,
  ) {
    let id: number;
    switch (type) {
      case 'walking':
        ({ id } = await this.walking.save(
          this.walking.create({ ...(dto as CreateWalkingDto), userId }),
        ));
        break;
      case 'running':
        ({ id } = await this.running.save(
          this.running.create({ ...(dto as CreateRunningDto), userId }),
        ));
        break;
      case 'gym':
        // Cascade inserts the exercises in the same transaction.
        ({ id } = await this.gym.save(
          this.gym.create({ ...(dto as CreateGymDto), userId }),
        ));
        break;
    }
    return { message: `${LABELS[type]} created`, id };
  }

  async remove(type: ActivityType, userId: number, id: number) {
    const repo = {
      walking: this.walking,
      running: this.running,
      gym: this.gym,
    }[type] as Repository<WalkingActivity | RunningActivity | GymWorkout>;
    const result = await repo.delete({ id, userId });
    if (!result.affected) {
      throw new NotFoundException(`${LABELS[type]} not found`);
    }
    return { message: `${LABELS[type]} deleted` };
  }
}
