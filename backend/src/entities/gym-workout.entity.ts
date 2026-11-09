import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { GymExercise } from './gym-exercise.entity.js';

@Entity({ name: 'gym_workouts' })
export class GymWorkout {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ type: 'date' })
  date: string;

  /** Minutes */
  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'int' })
  calories: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => GymExercise, (exercise) => exercise.workout, {
    cascade: ['insert'],
  })
  exercises: Relation<GymExercise>[];
}
