import type { AuthResponse, AuthTokens, LoginDto, RegisterDto, User } from '@expense-tracker/shared';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { CreateUserCommand } from '../users/commands/create-user.command';
import { GetUserByEmailQuery } from '../users/queries/get-user-by-email.query';
import { UserEntity } from '../users/user.entity';

import { JwtPayload } from './jwt-payload.interface';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.queryBus.execute<GetUserByEmailQuery, UserEntity | null>(
      new GetUserByEmailQuery(dto.email),
    );

    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.commandBus.execute<CreateUserCommand, UserEntity>(
      new CreateUserCommand(dto.email, dto.name, passwordHash),
    );

    return this.buildResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.queryBus.execute<GetUserByEmailQuery, UserEntity | null>(
      new GetUserByEmailQuery(dto.email),
    );

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildResponse(user);
  }

  private async buildResponse(user: UserEntity): Promise<AuthResponse> {
    const tokens = await this.issueTokens(user);
    return { user: this.toUser(user), tokens };
  }

  private async issueTokens(user: UserEntity): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: user.id, email: user.email };

    const accessExpiresIn = (process.env.JWT_EXPIRES_IN ??
      '3600s') as JwtSignOptions['expiresIn'];
    const refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ??
      '7d') as JwtSignOptions['expiresIn'];

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: accessExpiresIn }),
      this.jwtService.signAsync(payload, { expiresIn: refreshExpiresIn }),
    ]);

    return { accessToken, refreshToken };
  }

  private toUser(user: UserEntity): User {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
