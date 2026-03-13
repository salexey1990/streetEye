import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token (UUID format)',
    example: 'd8f3a7b2-1c4e-4f5a-8b9c-0d1e2f3a4b5c',
  })
  @IsUUID()
  @IsString()
  refreshToken!: string;
}
