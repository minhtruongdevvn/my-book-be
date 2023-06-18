import { Forgot } from '@app/databases';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForgotService } from './forgot.service';

@Module({
  imports: [TypeOrmModule.forFeature([Forgot])],
  providers: [ForgotService],
  exports: [ForgotService],
})
export class ForgotModule {}
