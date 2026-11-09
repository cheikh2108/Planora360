import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, HttpCode, HttpStatus, Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, systemRoleName } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('roles')
  findRoles(@CurrentUser() user: any) {
    return this.usersService.findRoles(user.organizationId, systemRoleName(user));
  }

  @Get('stats')
  @Roles('Super administrateur', 'Administrateur', 'Coordinateur')
  getStats(@CurrentUser() user: any) {
    return this.usersService.getStats(user.organizationId);
  }

  @Get('list-for-assignment')
  listForAssignment(@CurrentUser() user: any) {
    return this.usersService.findUsersForAssignment(user.organizationId);
  }

  @Post()
  @Roles('Super administrateur', 'Administrateur')
  create(@Body() dto: CreateUserDto, @CurrentUser() user: any) {
    return this.usersService.create(dto, user.organizationId, systemRoleName(user));
  }

  @Get()
  @Roles('Super administrateur', 'Administrateur', 'Coordinateur')
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.findAll(
      user.organizationId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('deleted')
  @Roles('Super administrateur', 'Administrateur')
  findDeleted(@CurrentUser() user: any) {
    return this.usersService.findDeleted(user.organizationId);
  }

  @Get(':id')
  @Roles('Super administrateur', 'Administrateur', 'Coordinateur')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.findOne(id, user.organizationId);
  }

  @Post(':id/restore')
  @Roles('Super administrateur', 'Administrateur')
  @HttpCode(HttpStatus.OK)
  restore(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.restore(id, user.organizationId);
  }

  @Patch(':id')
  @Roles('Super administrateur', 'Administrateur')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: any) {
    return this.usersService.update(id, dto, user.organizationId, systemRoleName(user));
  }

  @Delete(':id')
  @Roles('Super administrateur', 'Administrateur')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.remove(id, user.organizationId);
  }

  @Delete(':id/hard')
  @Roles('Super administrateur', 'Administrateur')
  @HttpCode(HttpStatus.NO_CONTENT)
  hardDelete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.hardDelete(id, user.organizationId);
  }
}
