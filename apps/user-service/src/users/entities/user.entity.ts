import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  Index,
  Check,
} from 'typeorm';

import { UserSettings } from './user-settings.entity';
import { UserStats } from './user-stats.entity';

export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
  MASTERCLASS = 'masterclass',
}

@Entity('users')
@Check(`"display_name" IS NULL OR (LENGTH("display_name") BETWEEN 2 AND 50)`)
@Check(`"bio" IS NULL OR LENGTH("bio") <= 500`)
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 50, name: 'display_name', nullable: true })
  displayName!: string | null;

  @Column({ type: 'varchar', length: 500, name: 'avatar_url', nullable: true })
  avatarUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'varchar', length: 5, default: 'ru' })
  language!: string;

  @Index()
  @Column({
    type: 'enum',
    enum: SubscriptionTier,
    default: SubscriptionTier.FREE,
    name: 'subscription_tier',
  })
  subscriptionTier!: SubscriptionTier;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;

  @Index()
  @Column({ type: 'timestamp with time zone', name: 'last_active_at', nullable: true })
  lastActiveAt!: Date | null;

  @DeleteDateColumn({ type: 'timestamp with time zone', name: 'deleted_at' })
  deletedAt!: Date | null;

  @OneToOne(() => UserSettings, (settings) => settings.user, { cascade: true })
  settings!: UserSettings;

  @OneToOne(() => UserStats, (stats) => stats.user, { cascade: true })
  stats!: UserStats;
}
