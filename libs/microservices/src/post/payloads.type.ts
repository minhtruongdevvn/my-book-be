interface Post {
  userId: number;
  title?: string;
  content?: string;
  backgroundCode?: string;
  picId?: string;
  interests?: number[];
}

export type Create = Post;

export interface Update extends Post {
  id: number;
}

export interface Delete {
  id: number;
  userId: number;
}

export interface GetByUser {
  userId: number;
  skip?: number;
  take?: number;
}
