export * from '../base/payload.type';

export interface Create {
  userId: number;
  name?: string;
  photo?: string;
  participants?: number[];
}

export interface Update {
  userId: number;
  convoId: string;
  name?: string;
  admin?: number;
  photo?: string;
}

export interface Participant {
  convoId: string;
  adminId: number;
  participantId: number;
}
