const parse = require("csv-parse/lib/sync");
const fs = require("fs");

const ATTRS = ["AQUA", "BOTTOM", "FISHING", "REC", "REGULATORY_AU", "WATER"];

const output = {};
for (const attr of ATTRS) {
  const input = fs.readFileSync(`./${attr}.csv`);
  const records = parse(input, {
    columns: true,
  });
  output[attr] = {};
  for (const record of records) {
    output[attr][record.value] = record.label;
  }
}

console.log(JSON.stringify(output, null, "  "));
