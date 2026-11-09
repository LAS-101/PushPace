import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { decimalTransformer } from '../common/numeric.transformer.js';

@Entity({ name: 'running_activities' })
export class RunningActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ type: 'date' })
  date: string;

  /** Minutes */
  @Column({ type: 'int' })
  duration: number;

  /** Kilometres */
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    transformer: decimalTransformer,
  })
  distance: number;

  /** Minutes per kilometre */
  @Column({
    type: 'decimal',
    precision: 4,
    scale: 2,
    transformer: decimalTransformer,
  })
  pace: number;

  @Column({ type: 'int' })
  calories: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
