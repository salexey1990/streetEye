import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { ChallengeCategory } from './challenge-category.entity';
import { ChallengeLocation } from './challenge-location.entity';

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  PRO = 'pro',
}

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ name: 'title_ru', type: 'varchar', length: 255 })
  titleRu!: string;

  @Column({ name: 'title_en', type: 'varchar', length: 255 })
  titleEn!: string;

  @Column({ name: 'category_id', type: 'varchar', length: 50 })
  categoryId!: string;

  @ManyToOne(() => ChallengeCategory, (category) => category.challenges)
  @JoinColumn({ name: 'category_id' })
  category!: ChallengeCategory;

  @Column({ type: 'varchar', length: 20 })
  difficulty!: DifficultyLevel;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'description_ru', type: 'text' })
  descriptionRu!: string;

  @Column({ name: 'description_en', type: 'text' })
  descriptionEn!: string;

  @Column({ type: 'text', nullable: true })
  tips!: string;

  @Column({ name: 'tips_ru', type: 'text', nullable: true })
  tipsRu!: string;

  @Column({ name: 'tips_en', type: 'text', nullable: true })
  tipsEn!: string;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  tags!: string[];

  @Column({
    name: 'estimated_time_minutes',
    type: 'int',
    default: 30,
  })
  estimatedTimeMinutes!: number;

  @Column({ name: 'is_premium', type: 'boolean', default: false })
  isPremium!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({
    name: 'example_photo_urls',
    type: 'varchar',
    array: true,
    nullable: true,
  })
  examplePhotoUrls!: string[];

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount!: number;

  @Column({ name: 'completion_count', type: 'int', default: 0 })
  completionCount!: number;

  @Column({
    name: 'average_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
  })
  averageRating!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone' })
  deletedAt!: Date;

  @OneToMany(() => ChallengeLocation, (location) => location.challenge)
  locations!: ChallengeLocation[];
}
