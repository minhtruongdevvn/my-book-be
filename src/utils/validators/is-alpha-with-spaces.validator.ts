import { ValidationOptions, registerDecorator } from 'class-validator';

export function IsAlphaWithSpaces(
  nullable = false,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAlphaWithSpaces',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (nullable && !value) return true;
          return (
            !!value &&
            typeof value === 'string' &&
            /^[a-zA-Z\s\u00C0-\u1EF9]*$/.test(value)
          );
        },
        defaultMessage() {
          return 'isAlphaWithSpaces';
        },
      },
    });
  };
}
