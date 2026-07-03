import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserEntity } from '../../user.entity';
import { UsersService } from '../../users.service';
import { CreateUserCommand } from '../create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, UserEntity> {
  constructor(private readonly usersService: UsersService) {}

  execute(command: CreateUserCommand): Promise<UserEntity> {
    const { email, name, passwordHash } = command;
    return this.usersService.create({ email, name, passwordHash });
  }
}
