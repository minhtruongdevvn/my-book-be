import { AllConfigType } from '@/config/config.type';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HomeService {
  constructor(private configService: ConfigService<AllConfigType>) {}

  appInfo() {
    return { name: this.configService.get('app.name', { infer: true }) };
  }
}
