import { Roles } from '@/roles/roles.decorator';
import { RoleEnum } from '@/roles/roles.enum';
import { RolesGuard } from '@/roles/roles.guard';
import { infinityPagination } from '@/utils/infinity-pagination';
import { User } from '@app/databases';
import {
  ClientProvider,
  InjectAppClient,
  USER_CHANGED_EVENT,
  USER_CREATED_EVENT,
  USER_DELETED_EVENT,
} from '@app/microservices';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InfinityPaginationResultType } from '../utils/types/infinity-pagination-result.type';
import { NullableType } from '../utils/types/nullable.type';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @InjectAppClient() private readonly client: ClientProvider,
  ) {}

  @SerializeOptions({
    groups: ['admin'],
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProfileDto: CreateUserDto): Promise<User> {
    const created = await this.usersService.create(createProfileDto);
    this.client.emit(USER_CREATED_EVENT, created.id);
    return created;
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<InfinityPaginationResultType<User>> {
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.usersService.findManyWithPagination({
        page,
        limit,
      }),
      { page, limit },
    );
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string): Promise<NullableType<User>> {
    return this.usersService.findOne({ id: +id });
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: number,
    @Body() updateProfileDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.usersService.update(id, updateProfileDto);
    this.client.emit(USER_CHANGED_EVENT, id);
    return user;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number): Promise<void> {
    this.client.emit(USER_DELETED_EVENT, id);
    return this.usersService.softDelete(id);
  }
}
