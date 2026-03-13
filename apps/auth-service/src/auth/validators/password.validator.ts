import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { PASSWORD_CONFIG } from '../auth.constants';

/**
 * Password strength validation constraint.
 * Validates that password meets security requirements:
 * - Minimum 8 characters
 * - Maximum 128 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
@ValidatorConstraint({ async: false, name: 'isPasswordStrong' })
export class IsPasswordStrongConstraint implements ValidatorConstraintInterface {
  private readonly PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;

  validate(password: string, args: ValidationArguments): boolean {
    if (!password) {
      return false;
    }

    if (password.length < PASSWORD_CONFIG.MIN_LENGTH) {
      return false;
    }

    if (password.length > PASSWORD_CONFIG.MAX_LENGTH) {
      return false;
    }

    return this.PASSWORD_REGEX.test(password);
  }

  defaultMessage(args: ValidationArguments): string {
    return `Password must be ${PASSWORD_CONFIG.MIN_LENGTH}-${PASSWORD_CONFIG.MAX_LENGTH} characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character`;
  }
}

/**
 * Decorator for password strength validation.
 * 
 * @param validationOptions - Additional validation options
 * 
 * @example
 * ```typescript
 * export class RegisterDto {
 *   @IsPasswordStrong()
 *   password!: string;
 * }
 * ```
 */
export function IsPasswordStrong(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPasswordStrongConstraint,
    });
  };
}
