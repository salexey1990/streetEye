import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: NestJwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateAccessToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email, type: 'access' },
      {
        expiresIn: this.configService.get<number>('jwt.accessTtl', 900),
        issuer: this.configService.get<string>('jwt.issuer', 'streetEye'),
        audience: this.configService.get<string>('jwt.audience', 'streetEye-app'),
      },
    );
  }

  generateRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      {
        expiresIn: this.configService.get<number>('jwt.refreshTtl', 604800),
        issuer: this.configService.get<string>('jwt.issuer', 'streetEye'),
        audience: this.configService.get<string>('jwt.audience', 'streetEye-app'),
      },
    );
  }

  verifyToken(token: string): any {
    return this.jwtService.verify(token);
  }
}
