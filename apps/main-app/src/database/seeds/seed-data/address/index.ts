import * as fs from 'fs';

interface Address {
  Name: string;
  Districts?: { Name: string }[];
}

interface Seed {
  province: string;
  subProvinces: string[];
}

fs.readFile(__dirname + '/address-raw.json', 'utf8', (err, data) => {
  if (err) throw err;
  const json: Address[] = JSON.parse(data);
  const seed: Seed[] = json.map((e) => {
    return {
      province: e.Name,
      subProvinces: e.Districts?.map((e) => e.Name) ?? [e.Name],
    };
  });

  fs.writeFile(
    __dirname + '/address-seed.json',
    JSON.stringify(seed, null, 2),
    (err) => {
      if (err) throw err;
    },
  );
});
