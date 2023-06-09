import { ValidationOptions, registerDecorator } from 'class-validator';

type SpecialCharacter =
  | '<'
  | '>'
  | '+'
  | '-'
  | '.'
  | ','
  | '['
  | ']'
  | '_'
  | '@'
  | ' '
  | '#';

export function IsAlphaOrNumberWithSpecial(
  special?: SpecialCharacter[],
  optional = false,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsAlphaOrNumberWithSpecial',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (optional && !value) return true;
          if (!special) {
            return typeof value === 'string' && /^[a-zA-Z0-9]*$/.test(value);
          }
          const regex = new RegExp(`^[a-zA-Z0-9${special.join('')}]*$`);
          return typeof value === 'string' && regex.test(value);
        },
        defaultMessage() {
          return `IsAlphaOrNumber${!!special ? 'With' + special.join('') : ''}`;
        },
      },
    });
  };
}
