import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsNotEmpty } from 'class-validator';

export class CreateLinkDto {
  @ApiProperty({ description: 'Title of the link', example: 'Getting Started' })
  @IsString()
  @IsNotEmpty()
  title!: string;
  
  @ApiProperty({ description: 'URL of the link', example: 'https://turborepo.org' })
  @IsUrl()
  @IsNotEmpty()
  url!: string;
  
  @ApiProperty({ description: 'Description of the link', example: 'Get started with Turborepo' })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
