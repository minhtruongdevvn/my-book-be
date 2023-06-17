import * as fs from 'fs';

interface RowData {
  isUserSubProvinceSame: number;
  ageDifference: number;
  isUserProvinceSame: number;
  mutualFriend: number;
  commonInterest: number;
  target: number;
}

function randint(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const numRows = 200000;

const rows: RowData[] = [];
let c = 0;
for (let i = 0; i < numRows; i++) {
  const isUserProvinceSame = randint(0, 10) > 7;
  const isUserSubProvinceSame = randint(0, 10) > 7;
  const ageDifference = Math.abs(randint(17, 60) - randint(17, 60));

  const mutualFriend = randint(0, 30);
  const commonInterest = randint(0, 20);

  let target = 0;
  if (isUserProvinceSame) {
    target += 0.2;
    if (isUserSubProvinceSame) target += 0.3;
  }

  if (mutualFriend >= 7) target += 0.1;
  if (mutualFriend >= 18) target += 0.175;
  if (mutualFriend >= 28) target += 0.35;

  if (ageDifference <= 5) target += 0.05;
  if (ageDifference <= 3) target += 0.15;

  if (commonInterest > 5) target += 0.1;
  if (commonInterest > 10) target += 0.125;

  target = target >= 0.5 ? 1 : 0;

  if (target == 1) c++;

  const row: RowData = {
    isUserProvinceSame: isUserProvinceSame ? 1 : 0,
    isUserSubProvinceSame: isUserSubProvinceSame ? 1 : 0,
    ageDifference,
    mutualFriend,
    commonInterest,
    target,
  };

  rows.push(row);
}

// Convert the data to a CSV file
const columns = [
  'isUserProvinceSame',
  'isUserSubProvinceSame',
  'ageDifference',
  'mutualFriend',
  'commonInterest',
  'target',
];
let csvContent = columns.join(',') + '\n';
for (const row of rows) {
  csvContent += Object.values(row).join(',') + '\n';
}

fs.writeFileSync(__dirname + '/data.csv', csvContent);
console.log(c);
