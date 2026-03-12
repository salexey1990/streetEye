import { ConflictException } from '@nestjs/common';

export class SessionAlreadyActiveException extends ConflictException {
  constructor(userId: string) {
    super({
      code: 'SESSION_ALREADY_ACTIVE',
      message: `User ${userId} already has an active session`,
    });
  }
}
