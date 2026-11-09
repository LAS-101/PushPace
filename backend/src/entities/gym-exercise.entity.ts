import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { decimalTransformer } from '../common/numeric.transformer.js';
import { GymWorkout } from './gym-workout.entity.js';

@Entity({ name: 'gym_exercises' })
export class GymExercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'workout_id', type: 'int' })
  workoutId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int' })
  sets: number;

  @Column({ type: 'int' })
  reps: number;

  /** Kilograms; 0 means bodyweight */
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    transformer: decimalTransformer,
  })
  weight: number;

  @ManyToOne(() => GymWorkout, (workout) => workout.exercises, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workout_id' })
  workout?: Relation<GymWorkout>;
}
