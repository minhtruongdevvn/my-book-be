import { Inject } from '@nestjs/common';

export const FRIEND_GRAPH_STORAGE = 'friend_graph_storage';
export const InjectStorage = () => Inject(FRIEND_GRAPH_STORAGE);
