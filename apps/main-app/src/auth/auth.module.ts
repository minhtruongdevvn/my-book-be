import { ForgotModule } from '@/forgot/forgot.module';
import { MailModule } from '@/mail/mail.module';
import { UsersModule } from '@/users/users.module';
import { IsExist } from '@/utils/validators/is-exists.validator';
import { IsNotExist } from '@/utils/validators/is-not-exists.validator';
import { IsValidAddressProvider } from '@/utils/validators/is-valid-address.validator';
import { Address, AddressSchema } from '@app/databases';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AnonymousStrategy } from './strategies/anonymous.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    ForgotModule,
    PassportModule,
    MailModule,
    JwtModule,
    MongooseModule.forFeature([{ name: Address.name, schema: AddressSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    IsExist,
    IsNotExist,
    AuthService,
    JwtStrategy,
    AnonymousStrategy,
    IsValidAddressProvider,
  ],
  exports: [AuthService],
})
export class AuthModule {}
