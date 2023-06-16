import * as fs from 'fs';

interface ProvinceData {
  province: string;
  subProvinces: string[];
}

interface RowData {
  userProvince: string;
  userSubProvince: string;
  userAge: number;
  friendProvince: string;
  friendSubProvince: string;
  friendAge: number;
  mutualFriend: number;
  target: number;
}

function choose<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randint(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

fs.readFile(
  __dirname + '/../address/address-seed.json',
  'utf8',
  (err, data) => {
    if (err) throw err;

    const numRows = 10000;
    const provinces: ProvinceData[] = JSON.parse(data);
    console.log(__dirname);
    const rows: RowData[] = [];
    for (let i = 0; i < numRows; i++) {
      const userProvinceData = choose(provinces) as ProvinceData;
      const userProvince = userProvinceData.province;
      const userSubProvince = choose(userProvinceData.subProvinces);
      const userAge = randint(18, 60);

      const friendProvinceData = choose(provinces) as ProvinceData;
      const friendProvince = friendProvinceData.province;
      const friendSubProvince = choose(friendProvinceData.subProvinces);
      const friendAge = randint(18, 60);

      const mutualFriend = randint(0, 10);

      let target = 0;
      if (userProvince === friendProvince) {
        target += 0.2;
        if (userSubProvince === friendSubProvince) {
          target += 0.2;
        }
      }
      if (Math.abs(userAge - friendAge) <= 5) {
        target += 0.1;
      }
      if (mutualFriend >= 5) {
        target += 0.1;
      }

      if (Math.abs(userAge - friendAge) <= 3) {
        target += 0.2;
      }
      if (mutualFriend >= 7) {
        target += 0.2;
      }

      target = target >= 0.6 ? 1 : 0;

      const row: RowData = {
        userProvince,
        userSubProvince,
        userAge,
        friendProvince,
        friendSubProvince,
        friendAge,
        mutualFriend,
        target,
      };

      rows.push(row);
    }

    // Convert the data to a CSV file
    const columns = [
      'userProvince',
      'userSubProvince',
      'userAge',
      'friendProvince',
      'friendSubProvince',
      'friendAge',
      'mutualFriend',
      'target',
    ];
    let csvContent = columns.join(',') + '\n';
    for (const row of rows) {
      csvContent += Object.values(row).join(',') + '\n';
    }

    fs.writeFileSync(__dirname + '/data.csv', csvContent);
  },
);
