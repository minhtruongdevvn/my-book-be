import { GetUser } from '@/auth/decorators/get-user.decorator';
import { Roles } from '@/roles/roles.decorator';
import { RoleEnum } from '@/roles/roles.enum';
import { RolesGuard } from '@/roles/roles.guard';
import { Interest } from '@app/databases';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { InterestCreateDto } from './dto/interest-create.dto';
import { InterestUpdateDto } from './dto/interest-update.dto';
import { InterestsService } from './interests.service';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Roles(RoleEnum.admin)
  @Post()
  create(@Body() dto: InterestCreateDto): Promise<Interest> {
    return this.interestsService.create(dto);
  }

  @Get()
  find(
    @Query('search') search?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<Interest[]> {
    return this.interestsService.find(search, skip, take);
  }

  @Get(':id')
  findById(@Param('id') id: number): Promise<Interest | null> {
    return this.interestsService.findById(id);
  }

  @Get('user/:userId')
  getInterestsByUserId(@Param('userId') userId: number): Promise<Interest[]> {
    return this.interestsService.getInterestsByUserId(userId);
  }

  @Roles(RoleEnum.admin)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: InterestUpdateDto,
  ): Promise<void> {
    await this.interestsService.update(id, dto);
  }

  @Roles(RoleEnum.admin)
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    await this.interestsService.remove(id);
  }

  @Post('users')
  addUserInterests(
    @Body() interestIds: number[],
    @GetUser('id') userId: number,
  ) {
    return this.interestsService.addUserInterests(userId, interestIds);
  }

  @Patch('users')
  deleteUserInterests(
    @Body() interestIds: number[],
    @GetUser('id') userId: number,
  ) {
    return this.interestsService.removeUserInterests(userId, interestIds);
  }
}
