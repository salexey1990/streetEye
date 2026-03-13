import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  Index,
} from 'typeorm';

import { User } from './user.entity';

@Entity('user_stats')
export class UserStats {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @OneToOne(() => User, (user) => user.stats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index()
  @Column({ type: 'int', name: 'total_challenges', default: 0 })
  totalChallenges!: number;

  @Column({ type: 'jsonb', name: 'challenges_by_category', default: {} })
  challengesByCategory!: Record<string, number>;

  @Column({ type: 'jsonb', name: 'challenges_by_difficulty', default: {} })
  challengesByDifficulty!: Record<string, number>;

  @Column({ type: 'int', name: 'marathons_started', default: 0 })
  marathonsStarted!: number;

  @Column({ type: 'int', name: 'marathons_completed', default: 0 })
  marathonsCompleted!: number;

  @Index()
  @Column({ type: 'int', name: 'total_xp', default: 0 })
  totalXp!: number;

  @Index()
  @Column({ type: 'int', name: 'level', default: 1 })
  level!: number;

  @Column({ type: 'int', name: 'current_streak', default: 0 })
  currentStreak!: number;

  @Column({ type: 'int', name: 'longest_streak', default: 0 })
  longestStreak!: number;

  @Column({ type: 'timestamp with time zone', name: 'last_activity_at', nullable: true })
  lastActivityAt!: Date | null;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;
}
