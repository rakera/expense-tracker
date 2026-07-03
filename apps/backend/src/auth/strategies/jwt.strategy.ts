import { Injectable, UnauthorizedException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { GetUserByIdQuery } from '../../users/queries/get-user-by-id.query';
import { UserEntity } from '../../users/user.entity';
import { AuthenticatedUser, JwtPayload } from '../jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly queryBus: QueryBus) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change-me',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.queryBus.execute<GetUserByIdQuery, UserEntity | null>(
      new GetUserByIdQuery(payload.sub),
    );

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return { userId: user.id, email: user.email };
  }
}
