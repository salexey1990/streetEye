import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum HeatModeSessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('heat_mode_sessions')
export class HeatModeSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 20, default: HeatModeSessionStatus.ACTIVE })
  status!: HeatModeSessionStatus;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes!: number;

  @Column({ name: 'interval_minutes', type: 'int', default: 15 })
  intervalMinutes!: number;

  @Column({ name: 'category_filter', type: 'varchar', length: 50, nullable: true })
  categoryFilter!: string;

  @Column({ name: 'difficulty_filter', type: 'varchar', length: 20, nullable: true })
  difficultyFilter!: string;

  @Column({ name: 'challenges_served', type: 'int', default: 0 })
  challengesServed!: number;

  @CreateDateColumn({ name: 'started_at', type: 'timestamp with time zone' })
  startedAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamp with time zone' })
  expiresAt!: Date;

  @Column({ name: 'completed_at', type: 'timestamp with time zone', nullable: true })
  completedAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;
}
