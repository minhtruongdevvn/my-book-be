import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsValidAddress(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidAddress',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsValidAddressProvider,
    });
  };
}

import { Address } from '@app/databases';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Model } from 'mongoose';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidAddressProvider implements ValidatorConstraintInterface {
  constructor(
    @InjectModel(Address.name)
    private readonly model: Model<Address>,
  ) {}
  async validate(value: string): Promise<boolean> {
    try {
      const [province, subProvince] = value.split(', ');
      if (!province || !subProvince) return false;

      const result = await this.model.exists({
        province,
        subProvince,
      });

      return !!result;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(): string {
    return 'address is not available or not follow format province/subProvince';
  }
}
