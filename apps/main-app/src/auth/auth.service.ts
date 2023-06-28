import { ForgotService } from '@/forgot/forgot.service';
import { MailService } from '@/mail/mail.service';
import { RoleEnum } from '@/roles/roles.enum';
import { SocialInterface } from '@/social/interfaces/social.interface';
import { StatusEnum } from '@/statuses/statuses.enum';
import { UsersService } from '@/users/users.service';
import { ClientError, ClientErrorException } from '@app/common';
import { Role, Status, User } from '@app/databases';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { plainToClass } from 'class-transformer';
import * as crypto from 'crypto';
import { LoginResponseType } from '../utils/types/auth/login-response.type';
import { NullableType } from '../utils/types/nullable.type';
import { AuthProvidersEnum } from './auth-providers.enum';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private forgotService: ForgotService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async getByRefreshToken(refreshToken: string) {
    let id: number;
    try {
      const claim = await this.jwtService.verifyAsync<{ id: number }>(
        refreshToken,
        {
          secret: this.configService.get('auth.refreshSecret'),
          ignoreExpiration: false,
        },
      );
      id = claim.id;
    } catch {
      throw new UnauthorizedException();
    }

    return await this.getCredentialData(id);
  }

  async getCredentialData(user: User | number): Promise<LoginResponseType> {
    if (!isNaN(+user)) {
      const queryResult = await this.usersService.findOne({
        id: user as number,
      });
      if (queryResult == null) {
        throw new ClientErrorException({
          name: ClientError.NotFound,
          description: `user with id: ${user} not found`,
        });
      }
      user = queryResult;
    }

    const actualUser: User = user as User;
    const token = this.jwtService.sign(
      {
        id: actualUser.id,
        role: actualUser.role,
      },
      {
        secret: this.configService.get('auth.secret'),
        expiresIn: this.configService.get('auth.expires'),
      },
    );

    const refresh = this.jwtService.sign(
      {
        id: actualUser.id,
      },
      {
        secret: this.configService.get('auth.refreshSecret'),
        expiresIn: this.configService.get('auth.refreshSecretExpired'),
      },
    );

    return { token, refresh, user: actualUser };
  }

  async validateLogin(
    loginDto: AuthEmailLoginDto,
    onlyAdmin: boolean,
  ): Promise<LoginResponseType> {
    const user = await this.usersService.findOne({
      email: loginDto.email,
    });

    if (
      !user ||
      (user?.role &&
        !(onlyAdmin ? [RoleEnum.admin] : [RoleEnum.user]).includes(
          user.role.id,
        ))
    ) {
      throw new ClientErrorException({ name: ClientError.NotFound });
    }

    if (user.provider !== AuthProvidersEnum.email) {
      throw new ClientErrorException({
        name: ClientError.UnprocessableEntity,
        description: `need login via provider: ${user.provider}`,
      });
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('incorrect password');
    }

    return await this.getCredentialData(user);
  }

  async validateSocialLogin(
    authProvider: string,
    socialData: SocialInterface,
  ): Promise<LoginResponseType> {
    let user: NullableType<User>;
    const socialEmail = socialData.email?.toLowerCase();

    const userByEmail = await this.usersService.findOne({
      email: socialEmail,
    });

    user = await this.usersService.findOne({
      socialId: socialData.id,
      provider: authProvider,
    });

    if (user) {
      if (socialEmail && !userByEmail) {
        user.email = socialEmail;
        await this.usersService.update(user.id, user);
      }
    } else if (userByEmail) {
      user = userByEmail;
    } else {
      const role = plainToClass(Role, {
        id: RoleEnum.user,
      });
      const status = plainToClass(Status, {
        id: StatusEnum.active,
      });

      user = await this.usersService.create({
        email: socialEmail ?? null,
        firstName: socialData.firstName ?? null,
        lastName: socialData.lastName ?? null,
        socialId: socialData.id,
        provider: authProvider,
        role,
        status,
      });

      user = await this.usersService.findOne({
        id: user.id,
      });
    }

    if (!user) {
      throw new ClientErrorException({
        name: ClientError.NotFound,
        description: 'user not found',
      });
    }

    return await this.getCredentialData(user);
  }

  async register(dto: AuthRegisterLoginDto): Promise<User> {
    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const created = await this.usersService.create({
      ...dto,
      email: dto.email,
      role: {
        id: RoleEnum.user,
      } as Role,
      status: {
        id: StatusEnum.inactive,
      } as Status,
      hash,
    });

    await this.mailService.userSignUp({
      to: dto.email,
      data: {
        hash,
      },
    });

    return created;
  }

  async confirmEmail(hash: string): Promise<void> {
    const user = await this.usersService.findOne({
      hash,
    });

    if (!user) {
      throw new ClientErrorException({
        name: ClientError.NotFound,
        description: 'user not found',
      });
    }

    user.hash = null;
    user.status = plainToClass(Status, {
      id: StatusEnum.active,
    });
    await user.save();
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findOne({
      email,
    });

    if (!user) {
      throw new ClientErrorException({
        name: ClientError.NotFound,
        description: 'email not exists',
      });
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');
    await this.forgotService.create({
      hash,
      user,
    });

    await this.mailService.forgotPassword({
      to: email,
      data: {
        hash,
      },
    });
  }

  async resetPassword(hash: string, password: string): Promise<void> {
    const forgot = await this.forgotService.findOne({
      where: {
        hash,
      },
    });

    if (!forgot) {
      throw new ClientErrorException({
        name: ClientError.NotFound,
        description: 'hash not exist',
      });
    }

    const user = forgot.user;
    user.password = password;

    await user.save();
    await this.forgotService.softDelete(forgot.id);
  }

  async me(user: User): Promise<NullableType<User>> {
    return this.usersService.findOne({
      id: user.id,
    });
  }

  async update(
    user: User,
    userDto: AuthUpdateDto,
  ): Promise<NullableType<User>> {
    if (userDto.password) {
      if (userDto.oldPassword) {
        const currentUser = await this.usersService.findOne({
          id: user.id,
        });

        if (!currentUser) {
          throw new ClientErrorException({
            name: ClientError.NotFound,
            description: 'user not found',
          });
        }

        const isValidOldPassword = await bcrypt.compare(
          userDto.oldPassword,
          currentUser.password,
        );

        if (!isValidOldPassword) {
          throw new ClientErrorException({
            name: ClientError.UnprocessableEntity,
            description: 'old password is not correct',
          });
        }
      } else {
        throw new ClientErrorException({
          name: ClientError.InvalidPayload,
          description: 'missing old password',
        });
      }
    }

    await this.usersService.update(user.id, userDto);

    return this.usersService.findOne({
      id: user.id,
    });
  }

  async softDelete(user: User): Promise<void> {
    await this.usersService.softDelete(user.id);
  }
}
