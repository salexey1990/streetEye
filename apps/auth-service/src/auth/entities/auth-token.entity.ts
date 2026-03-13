import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { TwoFactorSecret } from './two-factor-secret.entity';

export enum TokenType {
  REFRESH = 'refresh',
  BLACKLISTED = 'blacklisted',
}

@Entity('auth_tokens')
export class AuthToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Index()
  @Column({ type: 'varchar', length: 255, name: 'token_hash' })
  tokenHash!: string;

  @Index()
  @Column({
    type: 'enum',
    enum: TokenType,
    default: TokenType.REFRESH,
  })
  type!: TokenType;

  @Column({ type: 'jsonb', name: 'device_info', nullable: true })
  deviceInfo!: Record<string, any>;

  @Column({ type: 'inet', name: 'ip_address', nullable: true })
  ipAddress!: string;

  @Index()
  @Column({ type: 'timestamp with time zone', name: 'expires_at' })
  expiresAt!: Date;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'timestamp with time zone', name: 'revoked_at', nullable: true })
  revokedAt!: Date | null;

  @Column({ type: 'uuid', name: 'replaced_by', nullable: true })
  replacedBy!: string | null;

  @ManyToOne(() => TwoFactorSecret, { nullable: true })
  @JoinColumn({ name: 'replaced_by' })
  replacedByToken!: AuthToken | null;
}
