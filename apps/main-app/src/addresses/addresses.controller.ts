import { Roles } from '@/roles/roles.decorator';
import { RoleEnum } from '@/roles/roles.enum';
import { RolesGuard } from '@/roles/roles.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { AddressDto } from './dto/create-address.dto';

@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Addresses')
@Controller('addresses')
export class AddressesController {
  constructor(private addressService: AddressesService) {}

  @Post()
  create(@Body() dto: AddressDto) {
    return this.addressService.add(dto.province, dto.subProvince);
  }

  @Get()
  getProvinces(
    @Query('search') searchTerm: string | undefined,
    @Query('skip') skip: number | undefined,
    @Query('take') take: number | undefined,
  ) {
    return this.addressService.getProvinces(searchTerm, skip, take);
  }

  @Get(':province')
  getSubProvinces(
    @Param('province') province: string,
    @Query('search')
    searchTerm: string | undefined,
  ) {
    return this.addressService.getAllSubprovince(
      province.replace(/_/g, ' '),
      searchTerm,
    );
  }

  @Delete(':id')
  deleteById(@Param('id') id: string) {
    return this.addressService.deleteById(id);
  }

  @Delete()
  delete(@Body() dto: AddressDto) {
    return this.addressService.deleteAddress(dto.province, dto.subProvince);
  }
}
