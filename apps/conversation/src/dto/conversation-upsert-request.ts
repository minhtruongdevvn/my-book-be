import { Conversation } from '@app/databases';
import { ConversationDto } from './conversation.dto';

type Request = Partial<
  Omit<
    ExtractClassProperties<typeof Conversation, Function>,
    '_id' | 'id' | 'messages' | 'messageSeenLog'
  >
>;

export class ConversationUpsertRequest implements Request {
  constructor(convo: Request) {
    this.admin = convo.admin;
    this.name = convo.name;
    this.quickEmoji = convo.quickEmoji;
    this.theme = convo.theme;
    this.photo = convo.photo;
    this.participants = convo.participants;
  }

  admin?: number;
  quickEmoji?: string;
  name?: string;
  theme?: string;
  photo?: string;
  participants?: number[];
}

type ExtractClassProperties<
  TClass extends abstract new (...args: any) => any,
  TExcludePattern = never,
> = ExcludeMatchingProperties<
  { [Key in keyof InstanceType<TClass>]: InstanceType<TClass>[Key] },
  TExcludePattern
>;
type ExcludeMatchingProperties<TBase, TPattern> = Pick<
  TBase,
  { [K in keyof TBase]-?: TBase[K] extends TPattern ? never : K }[keyof TBase]
>;
