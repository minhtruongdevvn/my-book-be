/* eslint-disable */
const fs = require('fs');

fs.readFile('./seed-data/address-raw.json', 'utf8', (err, data) => {
  if (err) throw err;
  const json = JSON.parse(data);
  const seed = json.map((e) => {
    return {
      province: e.Name,
      subProvinces: e.Districts?.map((e) => e.Name) ?? [],
    };
  });

  fs.writeFile(
    './seed-data/address-seed.json',
    JSON.stringify(seed, null, 2),
    (err) => {
      if (err) throw err;
    },
  );
});
