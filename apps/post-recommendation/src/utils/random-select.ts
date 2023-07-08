import { Model } from 'mongoose';
import { RecommendationModel } from '../types';

export const randomSelect = (
  model: Model<RecommendationModel>,
  currIdx: number,
  limit: number,
  selects: number[],
): [number, number[]] => {
  const selected: number[] = [];

  for (let i = 0; i < limit; i++) {
    if (currIdx == selects.length) currIdx = 0;
    const randomIdx = randInt(currIdx, selects.length);
    selected.push(selects[randomIdx]);
    const tmp = selects[randomIdx];
    selects[randomIdx] = selects[currIdx];
    selects[currIdx++] = tmp;
  }

  return [currIdx, selected];
};

const randInt = (start: number, end: number) => {
  return Math.min(Math.floor(Math.random() * end) + start, end - 1);
};
