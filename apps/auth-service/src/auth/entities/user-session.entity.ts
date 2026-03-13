import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { AuthToken } from './auth-token.entity';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Index()
  @Column({ type: 'uuid', name: 'refresh_token_id', nullable: true })
  refreshTokenId!: string | null;

  @Column({ type: 'varchar', length: 50, name: 'device_type', nullable: true })
  deviceType!: string | null;

  @Column({ type: 'varchar', length: 100, name: 'device_model', nullable: true })
  deviceModel!: string | null;

  @Column({ type: 'varchar', length: 50, name: 'os_name', nullable: true })
  osName!: string | null;

  @Column({ type: 'varchar', length: 50, name: 'os_version', nullable: true })
  osVersion!: string | null;

  @Column({ type: 'varchar', length: 50, name: 'browser_name', nullable: true })
  browserName!: string | null;

  @Column({ type: 'varchar', length: 50, name: 'browser_version', nullable: true })
  browserVersion!: string | null;

  @Column({ type: 'inet', name: 'ip_address', nullable: true })
  ipAddress!: string | null;

  @Column({ type: 'text', name: 'user_agent', nullable: true })
  userAgent!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city!: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @Index()
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'last_active_at' })
  lastActiveAt!: Date;

  @Index()
  @Column({ type: 'timestamp with time zone', name: 'expires_at' })
  expiresAt!: Date;

  @ManyToOne(() => AuthToken, { nullable: true })
  @JoinColumn({ name: 'refresh_token_id' })
  refreshToken!: AuthToken | null;
}
