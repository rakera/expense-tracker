import { Controller, Get, Query } from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { CategoryEntity } from './category.entity';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Query('userId') userId: string): Promise<CategoryEntity[]> {
    return this.categoriesService.findAll(userId);
  }
}
