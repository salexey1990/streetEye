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

@Entity('user_settings')
export class UserSettings {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @OneToOne(() => User, (user) => user.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index()
  @Column({ type: 'boolean', name: 'notifications_enabled', default: true })
  notificationsEnabled!: boolean;

  @Column({ type: 'boolean', name: 'email_notifications', default: true })
  emailNotifications!: boolean;

  @Column({ type: 'boolean', name: 'push_notifications', default: true })
  pushNotifications!: boolean;

  @Column({ type: 'boolean', name: 'marketing_emails', default: false })
  marketingEmails!: boolean;

  @Column({ type: 'boolean', name: 'privacy_profile_public', default: false })
  privacyProfilePublic!: boolean;

  @Column({ type: 'boolean', name: 'privacy_stats_public', default: false })
  privacyStatsPublic!: boolean;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;
}
