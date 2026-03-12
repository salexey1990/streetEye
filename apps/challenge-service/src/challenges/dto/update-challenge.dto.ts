import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateChallengeDto } from './create-challenge.dto';

class UpdateChallengeBaseDto extends OmitType(CreateChallengeDto, ['categoryId'] as const) {
  @ApiPropertyOptional({ description: 'Category ID' })
  categoryId?: string;
}

export class UpdateChallengeDto extends PartialType(UpdateChallengeBaseDto) {}
