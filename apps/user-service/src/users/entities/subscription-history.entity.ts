import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { User } from './user.entity';

export enum SubscriptionEventType {
  CREATED = 'created',
  UPGRADED = 'upgraded',
  DOWNGRADED = 'downgraded',
  CANCELLED = 'cancelled',
  RESTORED = 'restored',
  EXPIRED = 'expired',
  RENEWED = 'renewed',
}

@Entity('subscription_history')
export class SubscriptionHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 20, name: 'from_tier', nullable: true })
  fromTier!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 20, name: 'to_tier' })
  toTier!: string;

  @Index()
  @Column({
    type: 'enum',
    enum: SubscriptionEventType,
    name: 'event_type',
  })
  eventType!: SubscriptionEventType;

  @Column({ type: 'jsonb', name: 'event_data', nullable: true })
  eventData!: Record<string, any> | null;

  @Index()
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;
}
