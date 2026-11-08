import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export const NAMA_COOKIE_TOKEN = 'token';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();

    const token =
      ambilTokenDariHeader(request) ?? ambilTokenDariCookie(request);
    if (!token) {
      throw new UnauthorizedException('Token tidak ditemukan');
    }

    try {
      request.user = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException(
        'Token tidak valid atau sudah kedaluwarsa',
      );
    }
    return true;
  }
}

function ambilTokenDariHeader(request: Request) {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' && token ? token : undefined;
}

function ambilTokenDariCookie(request: Request) {
  for (const cookie of request.headers.cookie?.split(';') ?? []) {
    const [kunci, ...nilai] = cookie.trim().split('=');
    if (kunci === NAMA_COOKIE_TOKEN) {
      return decodeURIComponent(nilai.join('='));
    }
  }
  return undefined;
}
