import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

import { HeatModeSessionManager } from './heat-mode-session.manager';
import { HeatModeSession, HeatModeSessionStatus } from '../entities/heat-mode-session.entity';
import { SessionAlreadyActiveException, SessionNotFoundException } from '../exceptions';

describe('HeatModeSessionManager', () => {
  let manager: HeatModeSessionManager;
  let repository: Repository<HeatModeSession>;

  const mockSession: HeatModeSession = {
    id: 'test-session-uuid',
    userId: 'user-123',
    status: HeatModeSessionStatus.ACTIVE,
    durationMinutes: 60,
    intervalMinutes: 15,
    categoryFilter: 'visual',
    difficultyFilter: 'intermediate',
    challengesServed: 0,
    startedAt: new Date(),
    expiresAt: new Date(Date.now() + 60 * 60000),
    createdAt: new Date(),
  } as HeatModeSession;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeatModeSessionManager,
        {
          provide: getRepositoryToken(HeatModeSession),
          useValue: mockRepository,
        },
      ],
    }).compile();

    manager = module.get<HeatModeSessionManager>(HeatModeSessionManager);
    repository = module.get<Repository<HeatModeSession>>(getRepositoryToken(HeatModeSession));
  });

  it('should be defined', () => {
    expect(manager).toBeDefined();
  });

  describe('createSession', () => {
    it('should create a new session', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockSession);
      mockRepository.save.mockResolvedValue(mockSession);

      const result = await manager.createSession({
        userId: 'user-123',
        durationMinutes: 60,
        categoryFilter: 'visual',
        difficultyFilter: 'intermediate',
      });

      expect(result).toBeDefined();
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw SessionAlreadyActiveException if user has active session', async () => {
      mockRepository.findOne.mockResolvedValue(mockSession);

      await expect(
        manager.createSession({
          userId: 'user-123',
          durationMinutes: 60,
        }),
      ).rejects.toThrow(SessionAlreadyActiveException);
    });
  });

  describe('findActiveSession', () => {
    it('should return active session for user', async () => {
      mockRepository.findOne.mockResolvedValue(mockSession);

      const result = await manager.findActiveSession('user-123');

      expect(result).toEqual(mockSession);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          status: HeatModeSessionStatus.ACTIVE,
        },
      });
    });

    it('should return null if no active session', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await manager.findActiveSession('user-123');

      expect(result).toBeNull();
    });
  });

  describe('validateSessionAccess', () => {
    it('should return session if user owns it', async () => {
      mockRepository.findOne.mockResolvedValue(mockSession);

      const result = await manager.validateSessionAccess('user-123', 'test-session-uuid');

      expect(result).toEqual(mockSession);
    });

    it('should throw SessionNotFoundException if session does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        manager.validateSessionAccess('user-123', 'non-existent-id'),
      ).rejects.toThrow(SessionNotFoundException);
    });

    it('should throw SessionNotFoundException if user does not own session', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockSession, userId: 'other-user' });

      await expect(
        manager.validateSessionAccess('user-123', 'test-session-uuid'),
      ).rejects.toThrow(SessionNotFoundException);
    });
  });

  describe('validateSessionStatus', () => {
    it('should not throw for active session', () => {
      expect(() => manager.validateSessionStatus(mockSession)).not.toThrow();
    });

    it('should throw for non-active session', () => {
      const cancelledSession = { ...mockSession, status: HeatModeSessionStatus.CANCELLED };

      expect(() => manager.validateSessionStatus(cancelledSession)).toThrow(NotFoundException);
    });
  });

  describe('getTimeRemaining', () => {
    it('should calculate time remaining in seconds', () => {
      const futureDate = new Date(Date.now() + 30 * 60000); // 30 minutes from now
      const session = { ...mockSession, expiresAt: futureDate };

      const result = manager.getTimeRemaining(session);

      expect(result).toBeCloseTo(1800, 0); // ~1800 seconds (30 minutes)
    });
  });

  describe('getTotalChallenges', () => {
    it('should calculate total challenges for session', () => {
      const session = { ...mockSession, durationMinutes: 60, intervalMinutes: 15 };

      const result = manager.getTotalChallenges(session);

      expect(result).toBe(4); // 60 / 15 = 4
    });
  });

  describe('getChallengesRemaining', () => {
    it('should calculate challenges remaining', () => {
      const session = { ...mockSession, durationMinutes: 60, intervalMinutes: 15, challengesServed: 2 };

      const result = manager.getChallengesRemaining(session);

      expect(result).toBe(2); // 4 total - 2 served = 2 remaining
    });
  });
});
