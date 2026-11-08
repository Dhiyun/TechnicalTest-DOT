import { Body, Controller, Get, HttpCode, Post, Req, UseGuards, Render, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { loginSchema, type LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard, NAMA_COOKIE_TOKEN, type JwtPayload } from './jwt-auth.guard.js';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('auth/login')
  @HttpCode(200)
  login(@Body({ schema: loginSchema }) dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('auth/me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request & { user: JwtPayload }) {
    return req.user;
  }

  @Get('login')
  @Render('auth/login')
  halamanLogin() {
    return { title: 'Login' }
  }

  // Web 
  @Post('login')
  async loginWeb(@Body() body: Record<string, string>, @Res() res: Response) {
    const hasil = loginSchema.safeParse(body);
    if (!hasil.success) {
      return res.status(400).render('auth/login', {
        title: 'Login',
        email: body.email,
        error: 'Email atau password tidak valid',
      })
    }

    try {
      const { accessToken } = await this.authService.login(hasil.data);
      res.cookie(NAMA_COOKIE_TOKEN, accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.redirect('/admin/kategori');
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return res.status(401).render('auth/login', {
          title: 'Login',
          email: body.email,
          error: error.message,
        });
      }
      throw error;
    }
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie(NAMA_COOKIE_TOKEN);
    return res.redirect('/login');
  }
}
