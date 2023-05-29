import { ValidationOptions, registerDecorator } from 'class-validator';

export function IsAlphaWithSpaces(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAlphaWithSpaces',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && /^[a-zA-Z\s]*$/.test(value);
        },
        defaultMessage() {
          return 'isAlphaWithSpaces';
        },
      },
    });
  };
}
