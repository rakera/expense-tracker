import type { LoginDto } from '@expense-tracker/shared';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // TODO: verify password hash and issue JWT tokens.
    return { id: user.id, email: user.email, name: user.name };
  }
}
