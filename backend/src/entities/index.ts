import { GymExercise } from './gym-exercise.entity.js';
import { GymWorkout } from './gym-workout.entity.js';
import { RunningActivity } from './running-activity.entity.js';
import { User } from './user.entity.js';
import { WalkingActivity } from './walking-activity.entity.js';

export { GymExercise, GymWorkout, RunningActivity, User, WalkingActivity };

export const ENTITIES = [
  User,
  WalkingActivity,
  RunningActivity,
  GymWorkout,
  GymExercise,
];
