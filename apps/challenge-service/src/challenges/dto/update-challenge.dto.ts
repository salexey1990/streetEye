import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateChallengeDto } from './create-challenge.dto';

class UpdateChallengeBaseDto extends OmitType(CreateChallengeDto, ['categoryId'] as const) {
  categoryId?: string;
}

export class UpdateChallengeDto extends PartialType(UpdateChallengeBaseDto) {}
