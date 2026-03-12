import { NotFoundException } from '@nestjs/common';

export class SessionNotFoundException extends NotFoundException {
  constructor(sessionId: string) {
    super({
      code: 'SESSION_NOT_FOUND',
      message: `Session with ID ${sessionId} not found`,
    });
  }
}
