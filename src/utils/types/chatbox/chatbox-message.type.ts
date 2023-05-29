import { Column } from 'typeorm';

export class ChatboxMessage {
  @Column()
  id: string;

  @Column()
  content: string;

  @Column()
  from: number;

  @Column({ default: false })
  isEdited: boolean;

  @Column({ type: 'timestamp with time zone' })
  at: Date;
}
