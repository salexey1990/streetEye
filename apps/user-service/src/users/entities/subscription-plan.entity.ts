import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SubscriptionInterval {
  MONTH = 'month',
  YEAR = 'year',
}

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Index()
  @Column({
    type: 'enum',
    enum: ['free', 'premium', 'masterclass'],
    name: 'tier',
  })
  tier!: 'free' | 'premium' | 'masterclass';

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({
    type: 'enum',
    enum: SubscriptionInterval,
    nullable: true,
  })
  interval!: SubscriptionInterval | null;

  @Column({ type: 'int', name: 'trial_days', default: 0 })
  trialDays!: number;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  features!: string[];

  @Column({ type: 'varchar', length: 100, name: 'stripe_price_id', nullable: true })
  stripePriceId!: string | null;

  @Column({ type: 'varchar', length: 100, name: 'apple_product_id', nullable: true })
  appleProductId!: string | null;

  @Column({ type: 'varchar', length: 100, name: 'google_product_id', nullable: true })
  googleProductId!: string | null;

  @Column({ type: 'boolean', name: 'popular', default: false })
  popular!: boolean;

  @Index()
  @Column({ type: 'boolean', name: 'active', default: true })
  active!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;
}
