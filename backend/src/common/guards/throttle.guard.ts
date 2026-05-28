import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const request = req as { ip?: string; headers?: Record<string, string>; user?: { id?: string } };
    // Use user ID if authenticated, otherwise fall back to IP
    if (request.user?.id) {
      return `user:${request.user.id}`;
    }
    const forwarded = request.headers?.['x-forwarded-for'];
    return forwarded ? String(forwarded).split(',')[0].trim() : (request.ip ?? 'unknown');
  }
}
