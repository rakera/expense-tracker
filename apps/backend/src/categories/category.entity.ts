import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ExpenseEntity } from '../expenses/expense.entity';
import { TransactionEntity } from '../transactions/transaction.entity';
import { UserEntity } from '../users/user.entity';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ default: '#7c3aed' })
  color!: string;

  @Column({ nullable: true })
  icon?: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, (user) => user.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @OneToMany(() => ExpenseEntity, (expense) => expense.category)
  expenses!: ExpenseEntity[];

  @OneToMany(() => TransactionEntity, (transaction) => transaction.category)
  transactions!: TransactionEntity[];
}
