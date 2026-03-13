import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AchievementCategory {
  CHALLENGE = 'challenge',
  MARATHON = 'marathon',
  STREAK = 'streak',
  SPECIAL = 'special',
}

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 500, name: 'icon_url', nullable: true })
  iconUrl!: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: AchievementCategory,
  })
  category!: AchievementCategory;

  @Column({ type: 'int', name: 'required_count' })
  requiredCount!: number;

  @Column({ type: 'varchar', length: 20, name: 'required_tier', nullable: true })
  requiredTier!: string | null;

  @Column({ type: 'int', name: 'points', default: 0 })
  points!: number;

  @Index()
  @Column({ type: 'boolean', name: 'hidden', default: false })
  hidden!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;
}
