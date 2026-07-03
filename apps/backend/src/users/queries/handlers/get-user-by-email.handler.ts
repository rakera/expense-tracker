import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UserEntity } from '../../user.entity';
import { UsersService } from '../../users.service';
import { GetUserByEmailQuery } from '../get-user-by-email.query';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery, UserEntity | null> {
  constructor(private readonly usersService: UsersService) {}

  execute(query: GetUserByEmailQuery): Promise<UserEntity | null> {
    return this.usersService.findByEmail(query.email);
  }
}
