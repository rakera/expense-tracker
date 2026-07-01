import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CategoryEntity } from '../categories/category.entity';
import { UserEntity } from '../users/user.entity';

@Entity('expenses')
export class ExpenseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('numeric', { precision: 12, scale: 2 })
  amount!: number;

  @Column({ default: 'USD' })
  currency!: string;

  @Column()
  description!: string;

  @Column({ type: 'date' })
  date!: string;

  @Column({ name: 'category_id' })
  categoryId!: string;

  @ManyToOne(() => CategoryEntity, (category) => category.expenses, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category!: CategoryEntity;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, (user) => user.expenses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
