import { HttpOnlyCookieInterceptor } from '@/utils/interceptors/http-only-cookie.interceptor';
import { User } from '@app/databases';
import {
  ClientProvider,
  InjectAppClient,
  UserEvents,
} from '@app/microservices';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Request,
  SerializeOptions,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request as RequestType } from 'express';
import { LoginResponseType } from '../utils/types/auth/login-response.type';
import { NullableType } from '../utils/types/nullable.type';
import { AuthService } from './auth.service';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    private readonly service: AuthService,
    @InjectAppClient() private readonly client: ClientProvider,
  ) {}

  @UseInterceptors(
    new HttpOnlyCookieInterceptor([['refresh_token', 'refresh']]),
  )
  @Get('logout')
  logout() {
    return { refresh: 'invalid' };
  }

  @UseInterceptors(
    new HttpOnlyCookieInterceptor([['refresh_token', 'refresh']]),
  )
  @Get('refresh')
  refresh(@Req() request: RequestType) {
    const token: string = request.cookies['refresh_token'];
    if (!token) {
      throw new UnauthorizedException();
    }

    return this.service.getByRefreshToken(token);
  }

  @UseInterceptors(
    new HttpOnlyCookieInterceptor([['refresh_token', 'refresh']]),
  )
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('email/login')
  @HttpCode(HttpStatus.OK)
  public login(
    @Body() loginDto: AuthEmailLoginDto,
  ): Promise<LoginResponseType> {
    return this.service.validateLogin(loginDto, false);
  }

  @UseInterceptors(
    new HttpOnlyCookieInterceptor([['refresh_token', 'refresh']]),
  )
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('admin/email/login')
  @HttpCode(HttpStatus.OK)
  public adminLogin(
    @Body() loginDTO: AuthEmailLoginDto,
  ): Promise<LoginResponseType> {
    return this.service.validateLogin(loginDTO, true);
  }

  @Post('email/register')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() createUserDto: AuthRegisterLoginDto): Promise<void> {
    if (!createUserDto.alias) {
      createUserDto.alias = createUserDto.email.replace(
        /^(.+)@(.+)\.(.+)$/,
        '$2:$1',
      );
    }
    const created = await this.service.register(createUserDto);
    this.client.emit(UserEvents.CREATED, created.id);
  }

  @Post('email/confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<void> {
    return this.service.confirmEmail(confirmEmailDto.hash);
  }

  @Post('forgot/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto,
  ): Promise<void> {
    return this.service.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto): Promise<void> {
    return this.service.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  public me(@Request() request): Promise<NullableType<User>> {
    return this.service.me(request.user);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async update(
    @Request() request,
    @Body() userDto: AuthUpdateDto,
  ): Promise<NullableType<User>> {
    const user = await this.service.update(request.user, userDto);
    this.client.emit(UserEvents.CHANGED, request.user.id);
    return user;
  }

  @ApiBearerAuth()
  @Delete('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Request() request): Promise<void> {
    this.client.emit(UserEvents.DELETED, request.user.id);
    await this.service.softDelete(request.user);
  }
}
