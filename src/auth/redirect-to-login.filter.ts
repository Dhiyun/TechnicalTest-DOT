import { ArgumentsHost, Catch, ExceptionFilter, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { NAMA_COOKIE_TOKEN } from './jwt-auth.guard.js';

@Catch(UnauthorizedException)
export class RedirectToLoginFilter implements ExceptionFilter {
    catch(_exception: UnauthorizedException, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();
        response.clearCookie(NAMA_COOKIE_TOKEN);
        response.redirect('/login');
    }
}
