import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Guardian that checks if the request has a valid authentication token.
 * 
 * In a real implementation, this would validate JWT tokens.
 * Currently serves as a placeholder for development.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // In a real implementation, validate the auth token
    // For now, we'll allow requests with an Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      // For development, allow unauthenticated requests
      // In production, throw new UnauthorizedException('UNAUTHORIZED');
      request.user = { id: 'anonymous', role: 'user' };
      return true;
    }

    // Parse and validate token
    // This is a placeholder for real JWT validation
    request.user = { id: 'user-123', role: 'user' };

    return true;
  }
}
