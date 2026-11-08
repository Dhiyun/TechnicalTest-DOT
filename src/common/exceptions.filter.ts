import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from '../generated/prisma/client.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request & { user?: unknown }>();
    const response = ctx.getResponse<Response>();

    const { status, body } = ubahKeRespons(exception);

    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url}`, exception instanceof Error ? exception.stack : String(exception));
    }

    if (request.accepts(['json', 'html']) === 'html') {
      return response.status(status).render('error', {
        title: `Error ${status}`,
        user: request.user,
        status,
        message: ambilPesan(body),
      });
    }

    return response.status(status).json(body);
  }
}

function ubahKeRespons(exception: unknown): { status: number; body: object } {
  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    const isi = exception.getResponse();
    return { status, body: typeof isi === 'string' ? { statusCode: status, message: isi } : isi };
  }

  if (exception instanceof Prisma.PrismaClientKnownRequestError) {
    if (exception.code === 'P2025') {
      return buatBody(HttpStatus.NOT_FOUND, 'Data tidak ditemukan');
    }
    if (exception.code === 'P2003') {
      return buatBody(HttpStatus.CONFLICT, 'Data masih dipakai oleh data lain');
    }
  }

  return buatBody(HttpStatus.INTERNAL_SERVER_ERROR, 'Terjadi kesalahan pada server');
}

function buatBody(status: number, message: string) {
  return { status, body: { statusCode: status, message } };
}

function ambilPesan(body: object): string {
  const message = (body as { message?: unknown }).message;
  if (Array.isArray(message)) {
    return message.join(', ');
  }
  return typeof message === 'string' ? message : 'Terjadi kesalahan';
}
