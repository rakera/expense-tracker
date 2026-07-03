import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GetUserByIdQuery } from '../users/queries/get-user-by-id.query';
import { UserEntity } from '../users/user.entity';

import { CategoryEntity } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
    private readonly queryBus: QueryBus,
  ) {}

  findAll(userId: string): Promise<CategoryEntity[]> {
    return this.categoriesRepository.find({ where: { userId } });
  }

  async findOne(userId: string, id: string): Promise<CategoryEntity> {
    const category = await this.categoriesRepository.findOne({ where: { id, userId } });

    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    return category;
  }

  async create(userId: string, dto: CreateCategoryDto): Promise<CategoryEntity> {
    const user = await this.queryBus.execute<GetUserByIdQuery, UserEntity | null>(
      new GetUserByIdQuery(userId),
    );

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const category = this.categoriesRepository.create({ ...dto, userId });
    return this.categoriesRepository.save(category);
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto): Promise<CategoryEntity> {
    const category = await this.findOne(userId, id);
    Object.assign(category, dto);
    return this.categoriesRepository.save(category);
  }

  async remove(userId: string, id: string): Promise<void> {
    const category = await this.findOne(userId, id);
    await this.categoriesRepository.remove(category);
  }
}
