import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Challenge } from './challenge.entity';

@Entity('challenge_categories')
export class ChallengeCategory {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'name_ru', type: 'varchar', length: 100 })
  nameRu!: string;

  @Column({ name: 'name_en', type: 'varchar', length: 100 })
  nameEn!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'description_ru', type: 'text', nullable: true })
  descriptionRu!: string;

  @Column({ name: 'description_en', type: 'text', nullable: true })
  descriptionEn!: string;

  @Column({ name: 'icon_url', type: 'varchar', length: 500, nullable: true })
  iconUrl!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;

  @OneToMany(() => Challenge, (challenge) => challenge.category)
  challenges!: Challenge[];
}
