import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';

import { CreateLinkDto } from './create-link.dto';

export class UpdateLinkDto extends PartialType(CreateLinkDto) {
  @ApiPropertyOptional({ description: 'Title of the link' })
  title?: string;
  
  @ApiPropertyOptional({ description: 'URL of the link' })
  url?: string;
  
  @ApiPropertyOptional({ description: 'Description of the link' })
  description?: string;
}
