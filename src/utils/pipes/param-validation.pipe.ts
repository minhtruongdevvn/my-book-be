import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

export class ParamValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'param' && metadata.metatype != undefined) {
      let parsedValue: any;
      switch (metadata.metatype.name) {
        case 'Number':
          parsedValue = Number(value);
          if (isNaN(parsedValue)) {
            throw new BadRequestException('Invalid route param');
          }
          break;
        case 'String':
          parsedValue = value;
          break;
      }
      return parsedValue;
    } else {
      return value;
    }
  }
}
