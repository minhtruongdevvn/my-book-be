import { registerDecorator, ValidationOptions } from 'class-validator';

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
  | '/'
  | '#';

export function IsAlphaOrNumberWithSpecial(
  special?: SpecialCharacter[],
  optional = false,
  allowNumber = true,
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
            return (
              typeof value === 'string' &&
              new RegExp(
                `^[a-zA-Z${allowNumber ? '0-9' : ''}\u00C0-\u1EF9]*$`,
              ).test(value)
            );
          }
          const regex = new RegExp(
            `^[a-zA-Z${allowNumber ? '0-9' : ''}${special.join(
              '',
            )}\u00C0-\u1EF9]*$`,
          );

          return typeof value === 'string' && regex.test(value);
        },
        defaultMessage() {
          return `IsAlphaOrNumber${!!special ? 'With' + special.join('') : ''}`;
        },
      },
    });
  };
}
