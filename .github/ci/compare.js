const fs = require('fs');

const inputObjectPath = process.argv[2];
const localJsonPath = process.argv[3];

// Read and parse the input object
const rawObjectData = fs.readFileSync(inputObjectPath, 'utf-8');
const translatedObject = eval('(' + rawObjectData + ')');

// Read and parse the local JSON file
const rawJsonData = fs.readFileSync(localJsonPath, 'utf-8');
const localJson = JSON.parse(rawJsonData);

// Compare the two parsed objects
if (JSON.stringify(translatedObject) === JSON.stringify(localJson)) {
  console.log('Matched!');
} else {
  console.error("JSON objects don't match!");
  process.exit(1);
}
