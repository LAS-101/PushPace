import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  GymExercise,
  GymWorkout,
  RunningActivity,
  WalkingActivity,
} from '../entities/index.js';
import { ActivitiesController } from './activities.controller.js';
import { ActivitiesService } from './activities.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalkingActivity,
      RunningActivity,
      GymWorkout,
      GymExercise,
    ]),
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
})
export class ActivitiesModule {}
