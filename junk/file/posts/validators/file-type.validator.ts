import { FileValidator, Injectable } from '@nestjs/common';

@Injectable()
export class FileTypeValidator extends FileValidator {
  isValid(file?: any): boolean | Promise<boolean> {
    return file.originalname.match(/\.(jpg|jpeg|png|gif)$/i);
  }

  buildErrorMessage(): string {
    return 'file not valid';
  }
}
