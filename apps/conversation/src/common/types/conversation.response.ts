import { ExtractClassProperties, MinimalUserDto } from '@app/common';
import { Conversation, Message, MessageSeenLog } from '@app/databases';

export class ConversationResponse
  implements Omit<BaseConversationResponse, '_id'>
{
  constructor(args: ConstructorArgs) {
    // note: testing shorthand method
    for (const key in args) {
      const shouldSkip =
        // avoided kineds
        ['function', 'undefined'].includes(typeof args[key]) ||
        // avoided keys
        ['id'].includes(key);

      if (shouldSkip) continue;

      this[key] = args[key];
    }

    this.id = args.id ?? args._id?.toString() ?? '';
  }

  id: string;
  participants: MinimalUserDto[];
  admin?: number;
  messages: Message[] = [];
  messageSeenLog: MessageSeenLog[];
  quickEmoji?: string;
  name?: string;
  theme?: string;
  photo?: string;
}

type ConstructorArgs = BaseConversationResponse & {
  id?: string;
  participants: MinimalUserDto[];
};
type BaseConversationResponse = ExtractClassProperties<
  Conversation,
  '_type' | 'participants' | 'id'
>;
