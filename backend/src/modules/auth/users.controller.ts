import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('auth/users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.authService.findAllUsers(search, page ? +page : 1, limit ? +limit : 20);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOneUser(+id);
  }

  @Post()
  create(@Body('username') username: string, @Body('email') email: string, @Body('password') password: string, @Body('role') role?: UserRole) {
    return this.authService.createUser(username, email, password, role);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: { username?: string; email?: string; password?: string; role?: UserRole }) {
    return this.authService.updateUser(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.removeUser(+id);
  }
}
