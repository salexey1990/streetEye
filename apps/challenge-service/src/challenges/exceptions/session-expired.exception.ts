import { GoneException } from '@nestjs/common';

export class SessionExpiredException extends GoneException {
  constructor(sessionId: string) {
    super({
      code: 'SESSION_EXPIRED',
      message: `Session ${sessionId} has expired`,
    });
  }
}
