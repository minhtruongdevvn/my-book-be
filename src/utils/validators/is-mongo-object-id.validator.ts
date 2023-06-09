import { ValidationOptions, registerDecorator } from 'class-validator';
import { ObjectId } from 'mongodb';

export function IsMongoObjectId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsMongoObjectId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return (
            !!value && typeof value === 'string' && ObjectId.isValid(value)
          );
        },
        defaultMessage() {
          return 'IsMongoObjectId';
        },
      },
    });
  };
}
