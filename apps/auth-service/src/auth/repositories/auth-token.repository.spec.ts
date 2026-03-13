import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { AuthTokenRepository } from './auth-token.repository';
import { AuthToken, TokenType } from '../entities/auth-token.entity';

describe('AuthTokenRepository', () => {
  let repository: AuthTokenRepository;
  let typeOrmRepository: Repository<AuthToken>;

  const mockTypeOrmRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthTokenRepository,
        {
          provide: getRepositoryToken(AuthToken),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<AuthTokenRepository>(AuthTokenRepository);
    typeOrmRepository = module.get<Repository<AuthToken>>(getRepositoryToken(AuthToken));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRefreshToken', () => {
    it('should create and save a new refresh token', async () => {
      const userId = 'user-id';
      const tokenHash = 'token-hash';
      const expiresIn = new Date();
      const deviceInfo = { browser: 'Chrome' };
      const ipAddress = '192.168.1.1';

      const createdToken = { userId, tokenHash, type: TokenType.REFRESH } as AuthToken;
      const savedToken = { ...createdToken, id: 'token-id' } as AuthToken;

      mockTypeOrmRepository.create.mockReturnValue(createdToken);
      mockTypeOrmRepository.save.mockResolvedValue(savedToken);

      const result = await repository.createRefreshToken(
        userId,
        tokenHash,
        expiresIn,
        deviceInfo,
        ipAddress,
      );

      expect(typeOrmRepository.create).toHaveBeenCalledWith({
        userId,
        tokenHash,
        type: TokenType.REFRESH,
        expiresAt: expiresIn,
        deviceInfo,
        ipAddress,
      });

      expect(typeOrmRepository.save).toHaveBeenCalledWith(createdToken);
      expect(result).toEqual(savedToken);
    });

    it('should create token without optional device info', async () => {
      const userId = 'user-id';
      const tokenHash = 'token-hash';
      const expiresIn = new Date();

      const createdToken = { userId, tokenHash, type: TokenType.REFRESH } as AuthToken;
      mockTypeOrmRepository.create.mockReturnValue(createdToken);
      mockTypeOrmRepository.save.mockResolvedValue(createdToken);

      await repository.createRefreshToken(userId, tokenHash, expiresIn);

      expect(typeOrmRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          tokenHash,
          type: TokenType.REFRESH,
          expiresAt: expiresIn,
        }),
      );
    });
  });

  describe('findByTokenHash', () => {
    it('should find refresh token by hash', async () => {
      const tokenHash = 'token-hash';
      const token = { id: 'token-id', tokenHash, type: TokenType.REFRESH } as AuthToken;

      mockTypeOrmRepository.findOne.mockResolvedValue(token);

      const result = await repository.findByTokenHash(tokenHash);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { tokenHash, type: TokenType.REFRESH, revokedAt: IsNull() as unknown as Date },
        relations: ['replacedByToken'],
      });

      expect(result).toEqual(token);
    });

    it('should return null if token not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByTokenHash('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('revokeToken', () => {
    it('should revoke token with replacement', async () => {
      const tokenId = 'token-id';
      const replacedBy = 'new-token-id';

      await repository.revokeToken(tokenId, replacedBy);

      expect(typeOrmRepository.update).toHaveBeenCalledWith(tokenId, {
        revokedAt: expect.any(Date),
        replacedBy,
        type: TokenType.BLACKLISTED,
      });
    });

    it('should revoke token without replacement', async () => {
      const tokenId = 'token-id';

      await repository.revokeToken(tokenId);

      expect(typeOrmRepository.update).toHaveBeenCalledWith(tokenId, {
        revokedAt: expect.any(Date),
        replacedBy: undefined,
        type: TokenType.BLACKLISTED,
      });
    });
  });

  describe('addToBlacklist', () => {
    it('should add token to blacklist', async () => {
      const tokenHash = 'token-hash';
      const expiresAt = new Date();

      const blacklistedToken = {
        tokenHash,
        type: TokenType.BLACKLISTED,
        expiresAt,
        revokedAt: expect.any(Date),
      };

      mockTypeOrmRepository.create.mockReturnValue(blacklistedToken);
      mockTypeOrmRepository.save.mockResolvedValue(blacklistedToken);

      await repository.addToBlacklist(tokenHash, expiresAt);

      expect(typeOrmRepository.create).toHaveBeenCalledWith({
        tokenHash,
        type: TokenType.BLACKLISTED,
        expiresAt,
        revokedAt: expect.any(Date),
      });

      expect(typeOrmRepository.save).toHaveBeenCalledWith(blacklistedToken);
    });
  });

  describe('isBlacklisted', () => {
    it('should return true if token is blacklisted', async () => {
      const tokenHash = 'token-hash';
      mockTypeOrmRepository.count.mockResolvedValue(1);

      const result = await repository.isBlacklisted(tokenHash);

      expect(result).toBe(true);
      expect(typeOrmRepository.count).toHaveBeenCalledWith({
        where: { tokenHash, type: TokenType.BLACKLISTED },
      });
    });

    it('should return false if token is not blacklisted', async () => {
      mockTypeOrmRepository.count.mockResolvedValue(0);

      const result = await repository.isBlacklisted('token-hash');

      expect(result).toBe(false);
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all tokens for a user', async () => {
      const userId = 'user-id';

      await repository.revokeAllUserTokens(userId);

      expect(typeOrmRepository.update).toHaveBeenCalledWith(
        { userId, type: TokenType.REFRESH, revokedAt: IsNull() as unknown as Date },
        { revokedAt: expect.any(Date), type: TokenType.BLACKLISTED },
      );
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should delete expired tokens', async () => {
      await repository.cleanupExpiredTokens();

      expect(typeOrmRepository.delete).toHaveBeenCalledWith({
        expiresAt: expect.any(Date),
      });
    });
  });

  describe('getActiveSessionsCount', () => {
    it('should return count of active sessions', async () => {
      const userId = 'user-id';
      mockTypeOrmRepository.count.mockResolvedValue(3);

      const result = await repository.getActiveSessionsCount(userId);

      expect(result).toBe(3);
      expect(typeOrmRepository.count).toHaveBeenCalledWith({
        where: { userId, type: TokenType.REFRESH, revokedAt: IsNull() as unknown as Date },
      });
    });

    it('should return 0 if no active sessions', async () => {
      mockTypeOrmRepository.count.mockResolvedValue(0);

      const result = await repository.getActiveSessionsCount('user-id');

      expect(result).toBe(0);
    });
  });
});
