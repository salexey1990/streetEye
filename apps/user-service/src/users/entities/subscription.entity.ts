import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';

import { User } from './user.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 50, name: 'plan_id', nullable: true })
  planId!: string | null;

  @ManyToOne(() => SubscriptionPlan, { nullable: true })
  @JoinColumn({ name: 'plan_id' })
  plan!: SubscriptionPlan | null;

  @Index()
  @Column({
    type: 'enum',
    enum: ['free', 'premium', 'masterclass'],
    name: 'tier',
  })
  tier!: 'free' | 'premium' | 'masterclass';

  @Index()
  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status!: SubscriptionStatus;

  @Column({ type: 'varchar', length: 100, name: 'stripe_subscription_id', nullable: true })
  stripeSubscriptionId!: string | null;

  @Column({ type: 'timestamp with time zone', name: 'current_period_start', nullable: true })
  currentPeriodStart!: Date | null;

  @Index()
  @Column({ type: 'timestamp with time zone', name: 'current_period_end', nullable: true })
  currentPeriodEnd!: Date | null;

  @Column({ type: 'boolean', name: 'cancel_at_period_end', default: false })
  cancelAtPeriodEnd!: boolean;

  @Column({ type: 'timestamp with time zone', name: 'cancelled_at', nullable: true })
  cancelledAt!: Date | null;

  @Column({ type: 'timestamp with time zone', name: 'trial_start', nullable: true })
  trialStart!: Date | null;

  @Index()
  @Column({ type: 'timestamp with time zone', name: 'trial_end', nullable: true })
  trialEnd!: Date | null;

  @Column({ type: 'boolean', name: 'auto_renew', default: true })
  autoRenew!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;
}
