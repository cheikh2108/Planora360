import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('roles')
  findRoles() {
    return this.usersService.findRoles();
  }

  @Post()
  @Roles('super_admin', 'org_admin')
  create(@Body() dto: CreateUserDto, @CurrentUser() user: any) {
    return this.usersService.create(dto, user.organizationId, user.role.name);
  }

  @Get()
  @Roles('super_admin', 'org_admin', 'coordonnateur')
  findAll(@CurrentUser() user: any) {
    return this.usersService.findAll(user.organizationId);
  }

  @Get(':id')
  @Roles('super_admin', 'org_admin', 'coordonnateur')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @Roles('super_admin', 'org_admin')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: any) {
    return this.usersService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @Roles('super_admin', 'org_admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.remove(id, user.organizationId);
  }
}
