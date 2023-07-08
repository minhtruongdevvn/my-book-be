export type RecommendationModel = {
  userId: number;
  postIds: number[];
  count: number;
  startIdx: number;
  [key: string]: any;
};
