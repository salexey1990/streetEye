import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Challenge } from './challenge.entity';

@Entity('challenge_locations')
export class ChallengeLocation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'challenge_id', type: 'uuid' })
  challengeId!: string;

  @ManyToOne(() => Challenge, (challenge) => challenge.locations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'challenge_id' })
  challenge!: Challenge;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ name: 'title_ru', type: 'varchar', length: 255, nullable: true })
  titleRu!: string;

  @Column({ name: 'title_en', type: 'varchar', length: 255, nullable: true })
  titleEn!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'description_ru', type: 'text', nullable: true })
  descriptionRu!: string;

  @Column({ name: 'description_en', type: 'text', nullable: true })
  descriptionEn!: string;

  @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 8 })
  locationLat!: number;

  @Column({ name: 'location_lng', type: 'decimal', precision: 11, scale: 8 })
  locationLng!: number;

  @Column({
    name: 'radius_meters',
    type: 'int',
    default: 100,
  })
  radiusMeters!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;
}
