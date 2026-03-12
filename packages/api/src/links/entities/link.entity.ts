import { ApiProperty } from '@nestjs/swagger';

export class Link {
  @ApiProperty({ description: 'Unique identifier', example: 0 })
  id!: number;
  
  @ApiProperty({ description: 'URL of the link', example: 'https://turborepo.org' })
  url!: string;
  
  @ApiProperty({ description: 'Title of the link', example: 'Getting Started' })
  title!: string;
  
  @ApiProperty({ description: 'Description of the link', example: 'Get started with Turborepo' })
  description!: string;
}
