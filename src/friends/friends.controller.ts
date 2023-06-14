import {
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
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { FriendsService } from './friends.service';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Friends')
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendService: FriendsService) {}

  @Get()
  get(
    @GetUser('id') userId: number,
    @Query('skip') skip: number | undefined,
    @Query('take') take: number | undefined,
    @Query('search') search: string | undefined,
  ) {
    return this.friendService.getFriendsByUserId(userId, take, skip, search);
  }

  @Post('requests/:recipientId')
  requestFriend(
    @Param('recipientId') recipientId: number,
    @GetUser('id') userId: number,
  ) {
    return this.friendService.createRequest(userId, recipientId);
  }

  @Delete('requests/:peerUserId')
  async cancelRequest(
    @Param('peerUserId') peerUserId: number,
    @GetUser('id') userId: number,
  ) {
    await this.friendService.cancelRequest(peerUserId, userId);
  }

  @Get('requests/:peerUserId/accept')
  acceptRequest(
    @Param('peerUserId') peerUserId: number,
    @GetUser('id') userId: number,
  ) {
    return this.friendService.acceptRequest(peerUserId, userId);
  }

  @Delete(':peerUserId')
  async unfriend(
    @Param('peerUserId') peerUserId: number,
    @GetUser('id') userId: number,
  ) {
    await this.friendService.unfriend(peerUserId, userId);
  }
}
