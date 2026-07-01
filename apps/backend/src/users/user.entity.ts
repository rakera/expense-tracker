import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CategoryEntity } from '../categories/category.entity';
import { ExpenseEntity } from '../expenses/expense.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @OneToMany(() => ExpenseEntity, (expense) => expense.user)
  expenses!: ExpenseEntity[];

  @OneToMany(() => CategoryEntity, (category) => category.user)
  categories!: CategoryEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
