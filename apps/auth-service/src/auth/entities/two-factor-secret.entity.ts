import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum TwoFactorMethod {
  TOTP = 'totp',
  EMAIL = 'email',
}

@Entity('two_factor_secrets')
export class TwoFactorSecret {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({
    type: 'enum',
    enum: TwoFactorMethod,
    default: TwoFactorMethod.TOTP,
  })
  method!: TwoFactorMethod;

  @Column({ type: 'varchar', length: 255, name: 'totp_secret', nullable: true })
  totpSecret!: string | null;

  @Column({ type: 'text', name: 'totp_backup_codes', array: true, nullable: true })
  totpBackupCodes!: string[] | null;

  @Column({
    type: 'text',
    name: 'totp_backup_codes_used',
    array: true,
    default: () => "'{}'",
  })
  totpBackupCodesUsed!: string[];

  @Index()
  @Column({ type: 'boolean', default: false })
  enabled!: boolean;

  @Column({ type: 'timestamp with time zone', name: 'enabled_at', nullable: true })
  enabledAt!: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;
}
