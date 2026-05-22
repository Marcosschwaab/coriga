import { Controller, Post, Get, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('role') role?: string,
  ) {
    if (!username || !email || !password) {
      throw new BadRequestException('Username, email, and password are required');
    }
    return this.authService.register(username, email, password, role as any);
  }

  @Public()
  @Post('login')
  login(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    if (!username || !password) {
      throw new BadRequestException('Username and password are required');
    }
    return this.authService.login(username, password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.id);
  }
}
