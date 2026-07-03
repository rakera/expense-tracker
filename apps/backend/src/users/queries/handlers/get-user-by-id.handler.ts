import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UserEntity } from '../../user.entity';
import { UsersService } from '../../users.service';
import { GetUserByIdQuery } from '../get-user-by-id.query';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery, UserEntity | null> {
  constructor(private readonly usersService: UsersService) {}

  execute(query: GetUserByIdQuery): Promise<UserEntity | null> {
    return this.usersService.findById(query.id);
  }
}
