import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';

import { User } from './user.entity';

export enum PurchaseType {
  COURSE = 'course',
}

export enum PaymentProvider {
  STRIPE = 'stripe',
  APPLE = 'apple',
  GOOGLE = 'google',
}

export enum LicenseType {
  LIFETIME = 'lifetime',
  TEMPORARY = 'temporary',
}

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index()
  @Column({
    type: 'enum',
    enum: PurchaseType,
    default: PurchaseType.COURSE,
  })
  type!: PurchaseType;

  @Index()
  @Column({ type: 'varchar', length: 100, name: 'item_id' })
  itemId!: string;

  @Column({ type: 'varchar', length: 255, name: 'item_name' })
  itemName!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
    name: 'payment_provider',
    nullable: true,
  })
  paymentProvider!: PaymentProvider | null;

  @Column({ type: 'varchar', length: 100, name: 'payment_intent_id', nullable: true })
  paymentIntentId!: string | null;

  @Column({ type: 'varchar', length: 500, name: 'receipt_url', nullable: true })
  receiptUrl!: string | null;

  @Column({
    type: 'enum',
    enum: LicenseType,
    name: 'license_type',
    default: LicenseType.LIFETIME,
  })
  licenseType!: LicenseType;

  @Index()
  @Column({ type: 'timestamp with time zone', name: 'access_expires_at', nullable: true })
  accessExpiresAt!: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;
}
