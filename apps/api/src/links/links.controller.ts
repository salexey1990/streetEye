import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { CreateLinkDto, UpdateLinkDto } from '@repo/api';

import { LinksService } from './links.service';

@ApiTags('links')
@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new link' })
  @ApiBody({ type: CreateLinkDto })
  @ApiResponse({ status: 201, description: 'Link successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input.' })
  create(@Body() createLinkDto: CreateLinkDto) {
    return this.linksService.create(createLinkDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all links' })
  @ApiResponse({ status: 200, description: 'Returns all links.' })
  findAll() {
    return this.linksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a link by ID' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Returns the link.' })
  @ApiResponse({ status: 404, description: 'Link not found.' })
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.linksService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a link' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiBody({ type: UpdateLinkDto })
  @ApiResponse({ status: 200, description: 'Link successfully updated.' })
  @ApiResponse({ status: 404, description: 'Link not found.' })
  update(@Param('id', ParseIntPipe) id: string, @Body() updateLinkDto: UpdateLinkDto) {
    return this.linksService.update(+id, updateLinkDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a link' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Link successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Link not found.' })
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.linksService.remove(+id);
  }
}
