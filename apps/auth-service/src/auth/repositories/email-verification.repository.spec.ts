import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EmailVerificationRepository } from './email-verification.repository';
import { EmailVerification } from '../entities/email-verification.entity';

describe('EmailVerificationRepository', () => {
  let repository: EmailVerificationRepository;
  let typeOrmRepository: Repository<EmailVerification>;

  const mockTypeOrmRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    increment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationRepository,
        {
          provide: getRepositoryToken(EmailVerification),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<EmailVerificationRepository>(EmailVerificationRepository);
    typeOrmRepository = module.get<Repository<EmailVerification>>(getRepositoryToken(EmailVerification));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save email verification', async () => {
      const userId = 'user-id';
      const email = 'user@example.com';
      const codeHash = 'code-hash';
      const expiresIn = new Date();

      const created = { userId, email, codeHash, expiresAt: expiresIn } as EmailVerification;
      const saved = { ...created, id: 'verification-id' } as EmailVerification;

      mockTypeOrmRepository.create.mockReturnValue(created);
      mockTypeOrmRepository.save.mockResolvedValue(saved);

      const result = await repository.create(userId, email, codeHash, expiresIn);

      expect(typeOrmRepository.create).toHaveBeenCalledWith({
        userId,
        email,
        codeHash,
        expiresAt: expiresIn,
        attempts: 0,
        verified: false,
      });

      expect(typeOrmRepository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(saved);
    });
  });

  describe('findByEmail', () => {
    it('should find unverified verification by email', async () => {
      const email = 'user@example.com';
      const verification = { id: 'v-id', email, verified: false } as EmailVerification;

      mockTypeOrmRepository.findOne.mockResolvedValue(verification);

      const result = await repository.findByEmail(email);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { email, verified: false, expiresAt: expect.any(Date) },
        order: { createdAt: 'DESC' },
      });

      expect(result).toEqual(verification);
    });

    it('should return null if no verification found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('markAsVerified', () => {
    it('should mark verification as verified', async () => {
      const id = 'verification-id';

      await repository.markAsVerified(id);

      expect(typeOrmRepository.update).toHaveBeenCalledWith(id, { verified: true });
    });
  });

  describe('incrementAttempts', () => {
    it('should increment attempts and return new count', async () => {
      const id = 'verification-id';
      mockTypeOrmRepository.increment.mockResolvedValue({ affected: 1 });
      mockTypeOrmRepository.findOne.mockResolvedValue({ attempts: 2 } as EmailVerification);

      const result = await repository.incrementAttempts(id);

      expect(typeOrmRepository.increment).toHaveBeenCalledWith({ id }, 'attempts', 1);
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(result).toBe(2);
    });

    it('should return 0 if record not found', async () => {
      mockTypeOrmRepository.increment.mockResolvedValue({ affected: 1 });
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.incrementAttempts('non-existent');

      expect(result).toBe(0);
    });
  });

  describe('isMaxAttemptsExceeded', () => {
    it('should return true if attempts >= maxAttempts', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue({
        attempts: 3,
        maxAttempts: 3,
      } as EmailVerification);

      const result = await repository.isMaxAttemptsExceeded('id');

      expect(result).toBe(true);
    });

    it('should return false if attempts < maxAttempts', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue({
        attempts: 2,
        maxAttempts: 3,
      } as EmailVerification);

      const result = await repository.isMaxAttemptsExceeded('id');

      expect(result).toBe(false);
    });

    it('should return false if record not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.isMaxAttemptsExceeded('id');

      expect(result).toBe(false);
    });
  });

  describe('cleanupExpired', () => {
    it('should delete expired verifications', async () => {
      await repository.cleanupExpired();

      expect(typeOrmRepository.delete).toHaveBeenCalledWith({
        expiresAt: expect.any(Date),
        verified: false,
      });
    });
  });
});
