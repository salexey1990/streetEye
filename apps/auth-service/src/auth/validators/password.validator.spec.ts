import { validate } from 'class-validator';
import { IsPasswordStrongConstraint, IsPasswordStrong } from '../validators/password.validator';

class TestDto {
  @IsPasswordStrong()
  password!: string;
}

describe('IsPasswordStrongConstraint', () => {
  let constraint: IsPasswordStrongConstraint;

  beforeEach(() => {
    constraint = new IsPasswordStrongConstraint();
  });

  describe('validate', () => {
    const mockArgs = {
      object: {},
      property: 'password',
      value: '',
      constraints: [],
      targetName: 'TestDto',
    };

    it('should accept strong password with all requirements', () => {
      const result = constraint.validate('Str0ng!Pass', mockArgs);
      expect(result).toBe(true);
    });

    it('should accept password with special characters', () => {
      const result = constraint.validate('MyP@ssw0rd!', mockArgs);
      expect(result).toBe(true);
    });

    it('should reject password without uppercase', () => {
      const result = constraint.validate('str0ng!pass', mockArgs);
      expect(result).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const result = constraint.validate('STR0NG!PASS', mockArgs);
      expect(result).toBe(false);
    });

    it('should reject password without number', () => {
      const result = constraint.validate('Strong!Pass', mockArgs);
      expect(result).toBe(false);
    });

    it('should reject password without special character', () => {
      const result = constraint.validate('Str0ngPass', mockArgs);
      expect(result).toBe(false);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = constraint.validate('Str0!P', mockArgs);
      expect(result).toBe(false);
    });

    it('should reject password longer than 128 characters', () => {
      const longPassword = 'A'.repeat(129) + '1!';
      const result = constraint.validate(longPassword, mockArgs);
      expect(result).toBe(false);
    });

    it('should reject empty password', () => {
      const result = constraint.validate('', mockArgs);
      expect(result).toBe(false);
    });

    it('should reject null password', () => {
      const result = constraint.validate(null as any, mockArgs);
      expect(result).toBe(false);
    });

    it('should reject undefined password', () => {
      const result = constraint.validate(undefined as any, mockArgs);
      expect(result).toBe(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return correct error message', () => {
      const message = constraint.defaultMessage({
        object: {},
        property: 'password',
        value: 'weak',
        constraints: [],
        target: {},
        targetName: 'TestDto',
      });

      expect(message).toContain('8-128 characters');
      expect(message).toContain('uppercase');
      expect(message).toContain('lowercase');
      expect(message).toContain('number');
      expect(message).toContain('special character');
    });
  });
});

describe('IsPasswordStrong decorator', () => {
  it('should validate strong password', async () => {
    const dto = new TestDto();
    dto.password = 'Str0ng!Pass';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject weak password without number', async () => {
    const dto = new TestDto();
    dto.password = 'WeakPass!';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isPasswordStrong');
  });

  it('should reject weak password without special char', async () => {
    const dto = new TestDto();
    dto.password = 'Str0ngPass';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isPasswordStrong');
  });

  it('should reject password that is too short', async () => {
    const dto = new TestDto();
    dto.password = 'Aa1!';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isPasswordStrong');
  });
});
