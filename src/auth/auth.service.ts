import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma/prisma.service';
import { AuthToken } from './auth.interfaces';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signUp(authDto: AuthDto): Promise<AuthToken> {
    const hash = await argon.hash(authDto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: authDto.email,
          hash,
        },
      });

      return this.signToken(user.id, user.email);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Cridentials taken');
      }
    }
  }

  async signIn(authDto: AuthDto): Promise<AuthToken> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: authDto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Cridentials incorrect');
    }

    const passwordMatches = await argon.verify(user.hash, authDto.password);

    if (!passwordMatches) {
      throw new ForbiddenException('Cridentials incorrect');
    }

    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: User['id'],
    email: User['email'],
  ): Promise<AuthToken> {
    const payload = {
      sub: userId,
      email,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('APP_SECRET'),
    });

    return { access_token: token };
  }
}
