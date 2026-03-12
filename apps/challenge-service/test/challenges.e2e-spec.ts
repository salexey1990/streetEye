import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from './../src/app.module';
import { Challenge, DifficultyLevel } from '../src/challenges/entities';

describe('ChallengesController (e2e)', () => {
  let app: INestApplication;

  const mockChallenge: Partial<Challenge> = {
    id: 'test-uuid',
    title: 'Test Challenge',
    titleRu: 'Тестове задание',
    titleEn: 'Test Challenge',
    categoryId: 'visual',
    difficulty: DifficultyLevel.BEGINNER,
    description: 'Test description',
    descriptionRu: 'Тестово описание',
    descriptionEn: 'Test description',
    tags: ['test'],
    estimatedTimeMinutes: 30,
    isPremium: false,
    isActive: true,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/challenges (GET)', () => {
    it('should return paginated challenges', () => {
      return request(app.getHttpServer())
        .get('/api/v1/challenges')
        .expect(200)
        .expect((res) => {
          expect(res.body.challenges).toBeDefined();
          expect(res.body.pagination).toBeDefined();
        });
    });
  });

  describe('/api/v1/challenges/categories (GET)', () => {
    it('should return all categories', () => {
      return request(app.getHttpServer())
        .get('/api/v1/challenges/categories')
        .expect(200)
        .expect((res) => {
          expect(res.body.categories).toBeDefined();
          expect(Array.isArray(res.body.categories)).toBe(true);
        });
    });
  });

  describe('/api/v1/challenges/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.timestamp).toBeDefined();
        });
    });
  });

  describe('/api/v1/challenges/:id (GET)', () => {
    it('should return 404 for non-existent challenge', () => {
      return request(app.getHttpServer())
        .get('/api/v1/challenges/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
